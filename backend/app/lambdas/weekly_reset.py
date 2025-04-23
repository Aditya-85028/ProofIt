import boto3
from datetime import datetime, timedelta
from app.utils.streak_manager import get_week_start_date, get_weekly_post_count

# Initialize DynamoDB
dynamodb = boto3.resource("dynamodb", region_name="us-east-1")
habit_table = dynamodb.Table("hb-habits-table")
posts_table = dynamodb.Table("hb-posts-table")

def update_grace_period(habit):
    """Update the grace period status for a habit that is in grace period"""
    try:
        user_id = habit["user_id"]
        habit_id = habit["habit_id"]
        
        created_at = datetime.fromisoformat(habit["created_at"])
        grace_period_end = created_at + timedelta(days=7)
        
        # If current time is past grace period end, update status
        if datetime.utcnow() > grace_period_end:
            habit_table.update_item(
                Key={
                    "user_id": user_id,
                    "habit_id": habit_id
                },
                UpdateExpression="SET is_in_grace_period = :grace",
                ExpressionAttributeValues={
                    ":grace": False
                }
            )
            print(f"  - Action: Grace period ended for habit {habit_id}")
            return True
        else:
            print(f"  - Action: Still in grace period for habit {habit_id}")
            return False
        
    except Exception as e:
        print(f"Error updating grace period for habit {habit_id}: {str(e)}")
        return False

def reset_habit_streak(habit):
    """Reset the streak for a habit if weekly posts don't meet cadence"""
    try:
        user_id = habit["user_id"]
        habit_id = habit["habit_id"]
        
        # Get the current week's start date
        current_week_start = get_week_start_date()
        weekly_posts = get_weekly_post_count(user_id, habit_id, current_week_start)
        cadence = habit.get("cadence", 0)
        
        print(f"Checking habit {habit_id}:")
        print(f"  - Weekly posts: {weekly_posts}")
        print(f"  - Cadence: {cadence}")
        print(f"  - Week start: {current_week_start}")
        
        # Only reset if posts don't meet cadence
        if weekly_posts < cadence:
            # Update the habit
            habit_table.update_item(
                Key={
                    "user_id": user_id,
                    "habit_id": habit_id
                },
                UpdateExpression="SET streak = :streak, last_week_posts = :posts, last_week_updated = :updated",
                ExpressionAttributeValues={
                    ":streak": 0,  # Reset streak to 0
                    ":posts": weekly_posts,
                    ":updated": datetime.utcnow().isoformat()
                }
            )
            print(f"  - Action: Reset streak to 0")
            return True
        else:
            print(f"  - Action: No reset needed (posts >= cadence)")
            return False
        
    except Exception as e:
        print(f"Error resetting streak for habit {habit_id}: {str(e)}")
        return False

def lambda_handler(event, context):
    """Lambda function to handle weekly habit resets"""
    try:
        # Scan all habits
        response = habit_table.scan()
        habits = response.get("Items", [])
        
        # Process each habit
        for habit in habits:
            print(f"\nProcessing habit {habit['habit_id']}:")
            
            # If habit is in grace period, check if it should end
            if habit.get("is_in_grace_period", True):
                update_grace_period(habit)
            # If habit is not in grace period, check if streak should be reset
            else:
                reset_habit_streak(habit)
            
        return {
            "statusCode": 200,
            "body": "Weekly reset completed successfully"
        }
        
    except Exception as e:
        print(f"Error in weekly reset: {str(e)}")
        return {
            "statusCode": 500,
            "body": f"Error in weekly reset: {str(e)}"
        } 