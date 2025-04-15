from fastapi import APIRouter, Query, HTTPException
import boto3
from boto3.dynamodb.conditions import Key

router = APIRouter()

# Initialize DynamoDB client
dynamodb = boto3.resource("dynamodb", region_name="us-east-1")
habit_table = dynamodb.Table("hb-habits-table")
user_table = dynamodb.Table("hb-user-table")

@router.delete("/delete_habit")
def delete_habit(
    user_id: str = Query(..., description="User's unique ID"),
    habit_id: str = Query(..., description="Habit's unique ID")
):
    """Delete a habit for a user from DynamoDB."""
    try:
        # First, check if the habit exists
        habit_response = habit_table.get_item(
            Key={
                "user_id": user_id,
                "habit_id": habit_id
            }
        )
        
        if "Item" not in habit_response:
            raise HTTPException(status_code=404, detail="Habit not found")
        
        # Delete the habit from the habits table
        habit_table.delete_item(
            Key={
                "user_id": user_id,
                "habit_id": habit_id
            }
        )
        
        # Update the user's habits list in the user table
        try:
            # Get the current user data
            user_response = user_table.get_item(
                Key={"user_id": user_id}
            )
            
            if "Item" not in user_response:
                print(f"⚠️ Warning: User {user_id} not found in user table")
            else:
                # Get the current habits list
                user_habits = user_response["Item"].get("habits", [])
                
                # Remove the habit_id from the list
                if habit_id in user_habits:
                    user_habits.remove(habit_id)
                    
                    # Update the user's habits list
                    user_table.update_item(
                        Key={"user_id": user_id},
                        UpdateExpression="SET habits = :habits",
                        ExpressionAttributeValues={
                            ":habits": user_habits
                        }
                    )
                    print(f"✅ Removed habit_id {habit_id} from user's habits list")
                else:
                    print(f"⚠️ Warning: Habit ID {habit_id} not found in user's habits list")
        except Exception as e:
            print(f"❌ Error updating user's habits list: {e}")
            # If updating the user table fails, we should still return success for the habit deletion
            # but log the error for debugging
            pass
        
        return {"message": "Habit deleted successfully"}
        
    except Exception as e:
        print(f"❌ DynamoDB error: {e}")
        raise HTTPException(status_code=500, detail=f"Error deleting habit: {str(e)}")