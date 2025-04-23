from datetime import datetime, timedelta
import boto3
from boto3.dynamodb.conditions import Key

# Initialize DynamoDB
dynamodb = boto3.resource("dynamodb", region_name="us-east-1")
habit_table = dynamodb.Table("hb-habits-table")
posts_table = dynamodb.Table("hb-posts-table")

def get_week_start_date(date=None):
    """Get the start date of the week (Monday) for a given date"""
    if date is None:
        date = datetime.utcnow()
    return (date - timedelta(days=date.weekday())).replace(hour=0, minute=0, second=0, microsecond=0)

def is_in_grace_period(habit):
    """Check if a habit is in its grace period"""
    created_at = datetime.fromisoformat(habit.get("created_at"))
    week_start = get_week_start_date(created_at)
    next_week_start = week_start + timedelta(days=7)
    return datetime.utcnow() < next_week_start

def get_weekly_post_count(user_id, habit_id, week_start):
    """Get the number of posts for a habit in a given week"""
    week_end = week_start + timedelta(days=7)
    
    response = posts_table.query(
        KeyConditionExpression=Key("user_id").eq(user_id),
        FilterExpression="habitId = :habit_id AND #ts BETWEEN :week_start AND :week_end",
        ExpressionAttributeNames={
            "#ts": "timestamp"
        },
        ExpressionAttributeValues={
            ":habit_id": habit_id,
            ":week_start": week_start.isoformat(),
            ":week_end": week_end.isoformat()
        }
    )
    
    return len(response.get("Items", []))

def increment_habit_streak(user_id, habit_id):
    """Update the streak for a habit based on weekly post count"""
    try:
        # Get the habit
        habit_response = habit_table.get_item(
            Key={
                "user_id": user_id,
                "habit_id": habit_id
            }
        )
        
        if "Item" not in habit_response:
            return False
            
        habit = habit_response["Item"]
            
        current_week_start = get_week_start_date()
        weekly_posts = get_weekly_post_count(user_id, habit_id, current_week_start)
        cadence = habit.get("cadence", 0)
        
        # Only update streak if reminder is false (not already incremented)
        if weekly_posts >= cadence and not habit.get("reminder", True):
            new_streak = habit.get("streak", 0) + 1
            
            # Update the habit
            habit_table.update_item(
                Key={
                    "user_id": user_id,
                    "habit_id": habit_id
                },
                UpdateExpression="SET streak = :streak, last_week_posts = :posts, last_week_updated = :updated",
                ExpressionAttributeValues={
                    ":streak": new_streak,
                    ":posts": weekly_posts,
                    ":updated": datetime.utcnow().isoformat()
                })
            return True
        else:
            return False
    
    except Exception as e:
        print(f"Error updating streak: {str(e)}")
        return False
