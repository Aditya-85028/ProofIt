import boto3
from datetime import datetime, timedelta
import uuid
import time

# Initialize DynamoDB
dynamodb = boto3.resource("dynamodb", region_name="us-east-1")
habit_table = dynamodb.Table("hb-habits-table")
posts_table = dynamodb.Table("hb-posts-table")

# Initialize Lambda
lambda_client = boto3.client('lambda')

def create_test_habit(user_id, cadence=3, is_in_grace_period=False, created_recently=False):
    """Create a test habit with optional parameters"""
    habit_id = str(uuid.uuid4())
    
    # Set created_at based on whether we want an ongoing grace period
    if created_recently:
        created_at = datetime.utcnow() - timedelta(days=3)  # 3 days ago
    else:
        created_at = datetime.utcnow() - timedelta(days=14)  # 2 weeks ago
    
    habit_table.put_item(Item={
        "user_id": user_id,
        "habit_id": habit_id,
        "habit_name": "Test Habit",
        "color": "#FF0000",
        "cadence": cadence,
        "streak": 5,  # Set initial streak
        "created_at": created_at.isoformat(),
        "last_week_posts": 0,
        "last_week_updated": datetime.utcnow().isoformat(),
        "is_in_grace_period": is_in_grace_period
    })
    
    return habit_id

def create_test_posts(user_id, habit_id, count=2):
    """Create test posts for the habit"""
    for i in range(count):
        timestamp = datetime.utcnow() - timedelta(days=i)
        post_id = f"post-{habit_id}-{timestamp.strftime('%Y%m%dT%H%M%S')}"
        
        posts_table.put_item(Item={
            'user_id': user_id,
            'post_id': post_id,
            'habitId': habit_id,
            'caption': f"Test post {i+1}",
            'timestamp': timestamp.isoformat(),
            's3Key': f"test/test.jpg"
        })

def check_habit_streak(user_id, habit_id):
    """Check the current streak of a habit"""
    response = habit_table.get_item(
        Key={
            "user_id": user_id,
            "habit_id": habit_id
        }
    )
    
    if "Item" in response:
        return response["Item"].get("streak", 0)
    return None

def invoke_reset_lambda():
    """Invoke the reset Lambda function"""
    response = lambda_client.invoke(
        FunctionName='habit-streak-reset',
        InvocationType='RequestResponse'
    )
    return response

def cleanup_test_data(user_id, habit_id):
    """Clean up test data"""
    # Delete habit
    habit_table.delete_item(
        Key={
            "user_id": user_id,
            "habit_id": habit_id
        }
    )
    
    # Delete posts
    response = posts_table.query(
        KeyConditionExpression="user_id = :uid",
        FilterExpression="habitId = :hid",
        ExpressionAttributeValues={
            ":uid": user_id,
            ":hid": habit_id
        }
    )
    
    for post in response.get("Items", []):
        posts_table.delete_item(
            Key={
                "user_id": post["user_id"],
                "post_id": post["post_id"]
            }
        )

def run_test():
    """Run the complete test"""
    test_user_id = f"test-user-{uuid.uuid4()}"
    habit_id = None
    
    try:
        print("\n🏃‍♂️ Starting test...")
        
        # Create test habit
        habit_id = create_test_habit(test_user_id)
        print(f"✅ Created test habit with ID: {habit_id}")
        
        # Check initial streak
        initial_streak = check_habit_streak(test_user_id, habit_id)
        print(f"📊 Initial streak: {initial_streak}")
        
        # Create some posts (less than cadence)
        create_test_posts(test_user_id, habit_id, count=2)
        print("✅ Created test posts (2 posts, which is less than cadence of 3)")
        
        # Invoke Lambda
        print("\n🔄 Invoking reset Lambda...")
        response = invoke_reset_lambda()
        print(f"✅ Lambda response status: {response['StatusCode']}")
        
        # Give DynamoDB a moment to update
        print("⏳ Waiting for DynamoDB to update...")
        time.sleep(2)
        
        # Check final streak
        final_streak = check_habit_streak(test_user_id, habit_id)
        print(f"📊 Final streak: {final_streak}")
        
        # Verify reset
        if final_streak == 0:
            print("✅ Test passed: Streak was reset to 0 as expected (posts < cadence)")
        else:
            print("❌ Test failed: Streak was not reset to 0")
            
    except Exception as e:
        print(f"❌ Error during test: {str(e)}")
    
    finally:
        if habit_id:
            # Cleanup
            print("\n🧹 Cleaning up test data...")
            cleanup_test_data(test_user_id, habit_id)
            print("✅ Cleanup complete")

def run_no_reset_test():
    """Run a test where streak should not be reset"""
    test_user_id = f"test-user-{uuid.uuid4()}"
    habit_id = None
    
    try:
        print("\n🏃‍♂️ Starting no-reset test...")
        
        # Create test habit
        habit_id = create_test_habit(test_user_id, cadence=2)  # Set cadence to 2
        print(f"✅ Created test habit with ID: {habit_id}")
        
        # Check initial streak
        initial_streak = check_habit_streak(test_user_id, habit_id)
        print(f"📊 Initial streak: {initial_streak}")
        
        # Create posts (meeting cadence)
        create_test_posts(test_user_id, habit_id, count=2)  # Create 2 posts, meeting cadence
        print("✅ Created test posts (2 posts, which meets cadence of 2)")
        
        # Invoke Lambda
        print("\n🔄 Invoking reset Lambda...")
        response = invoke_reset_lambda()
        print(f"✅ Lambda response status: {response['StatusCode']}")
        
        # Give DynamoDB a moment to update
        print("⏳ Waiting for DynamoDB to update...")
        time.sleep(2)
        
        # Check final streak
        final_streak = check_habit_streak(test_user_id, habit_id)
        print(f"📊 Final streak: {final_streak}")
        
        # Verify no reset
        if final_streak == 5:
            print("✅ Test passed: Streak remained at 5 as expected (posts >= cadence)")
        else:
            print("❌ Test failed: Streak was reset when it shouldn't have been")
            
    except Exception as e:
        print(f"❌ Error during test: {str(e)}")
    
    finally:
        if habit_id:
            # Cleanup
            print("\n🧹 Cleaning up test data...")
            cleanup_test_data(test_user_id, habit_id)
            print("✅ Cleanup complete")

def run_grace_period_test():
    """Run a test to verify grace period functionality"""
    test_user_id = f"test-user-{uuid.uuid4()}"
    habit_id = None
    
    try:
        print("\n🏃‍♂️ Starting grace period test...")
        
        # Create test habit with grace period
        habit_id = create_test_habit(test_user_id, is_in_grace_period=True)
        print(f"✅ Created test habit with ID: {habit_id}")
        
        # Check initial grace period status
        initial_status = check_habit_grace_period(test_user_id, habit_id)
        print(f"📊 Initial grace period status: {initial_status}")
        
        # Invoke Lambda
        print("\n🔄 Invoking reset Lambda...")
        response = invoke_reset_lambda()
        print(f"✅ Lambda response status: {response['StatusCode']}")
        
        # Give DynamoDB a moment to update
        print("⏳ Waiting for DynamoDB to update...")
        time.sleep(2)
        
        # Check final grace period status
        final_status = check_habit_grace_period(test_user_id, habit_id)
        print(f"📊 Final grace period status: {final_status}")
        
        # Verify grace period status
        if final_status == False:
            print("✅ Test passed: Grace period ended as expected")
        else:
            print("❌ Test failed: Grace period did not end when it should have")
            
    except Exception as e:
        print(f"❌ Error during test: {str(e)}")
    
    finally:
        if habit_id:
            # Cleanup
            print("\n🧹 Cleaning up test data...")
            cleanup_test_data(test_user_id, habit_id)
            print("✅ Cleanup complete")

def run_ongoing_grace_period_test():
    """Run a test to verify grace period continues when it should"""
    test_user_id = f"test-user-{uuid.uuid4()}"
    habit_id = None
    
    try:
        print("\n🏃‍♂️ Starting ongoing grace period test...")
        
        # Create test habit with grace period (created recently)
        habit_id = create_test_habit(test_user_id, is_in_grace_period=True, created_recently=True)
        print(f"✅ Created test habit with ID: {habit_id}")
        
        # Check initial grace period status
        initial_status = check_habit_grace_period(test_user_id, habit_id)
        print(f"📊 Initial grace period status: {initial_status}")
        
        # Invoke Lambda
        print("\n🔄 Invoking reset Lambda...")
        response = invoke_reset_lambda()
        print(f"✅ Lambda response status: {response['StatusCode']}")
        
        # Give DynamoDB a moment to update
        print("⏳ Waiting for DynamoDB to update...")
        time.sleep(2)
        
        # Check final grace period status
        final_status = check_habit_grace_period(test_user_id, habit_id)
        print(f"📊 Final grace period status: {final_status}")
        
        # Verify grace period status
        if final_status == True:
            print("✅ Test passed: Grace period continues as expected")
        else:
            print("❌ Test failed: Grace period ended when it shouldn't have")
            
    except Exception as e:
        print(f"❌ Error during test: {str(e)}")
    
    finally:
        if habit_id:
            # Cleanup
            print("\n🧹 Cleaning up test data...")
            cleanup_test_data(test_user_id, habit_id)
            print("✅ Cleanup complete")

def check_habit_grace_period(user_id, habit_id):
    """Check the current grace period status of a habit"""
    response = habit_table.get_item(
        Key={
            "user_id": user_id,
            "habit_id": habit_id
        }
    )
    
    if "Item" in response:
        return response["Item"].get("is_in_grace_period", True)
    return None

if __name__ == "__main__":
    print("Running test scenario 1: Streak should be reset (posts < cadence)")
    run_test()
    
    print("\nRunning test scenario 2: Streak should not be reset (posts >= cadence)")
    run_no_reset_test()
    
    print("\nRunning test scenario 3: Grace period should end")
    run_grace_period_test()
    
    print("\nRunning test scenario 4: Grace period should continue")
    run_ongoing_grace_period_test() 