#!/usr/bin/env python3

import rospy
import actionlib
from move_base_msgs.msg import MoveBaseAction, MoveBaseGoal

# Callbacks definition
def active_cb(extra):
    rospy.loginfo("Goal pose being processed")

def feedback_cb(feedback):
    rospy.loginfo("Current location: "+str(feedback))

def done_cb(status, result):
    if status == 3:
        rospy.loginfo("Goal reached")
    if status == 2 or status == 8:
        rospy.loginfo("Goal cancelled")
    if status == 4:
        rospy.loginfo("Goal aborted")
   
# Destination Functions
def set_goal_pose(goal, position_x, position_y, position_z):
    """
    Set the position of the target pose in the given goal object.

    Parameters:
        - goal (object): The goal object to which the target pose should be set.
        - position_x (float): The X-coordinate of the desired position.
        - position_y (float): The Y-coordinate of the desired position.
        - position_z (float): The Z-coordinate of the desired position.
    """
    goal.target_pose.pose.position.x = position_x
    goal.target_pose.pose.position.y = position_y
    goal.target_pose.pose.position.z = position_z
    
def set_goal_orientation(goal, orientation_x, orientation_y, orientation_z, orientation_w):
    """
    Set the orientation of the target pose in the given goal object.

    Parameters:
        - goal (object): The goal object to which the target pose should be set.
        - position_x (float): The X-orientation of the desired orientation.
        - position_y (float): The Y-orientation of the desired orientation.
        - position_z (float): The Z-orientation of the desired orientation.
        - position_w (float): The W-orientation of the desired orientation.
    """
    goal.target_pose.pose.orientation.x = orientation_x
    goal.target_pose.pose.orientation.y = orientation_y
    goal.target_pose.pose.orientation.z = orientation_z
    goal.target_pose.pose.orientation.w = orientation_w
    
dest_pose_str = sys.stdin.read().split()
dest_pose_x = int(dest_pose_str[0])
dest_pose_y = int(dest_pose_str[1])

# Initialise navigation node
rospy.init_node('goal_pose')

# Conduct client connection
navclient = actionlib.SimpleActionClient('move_base',MoveBaseAction)
navclient.wait_for_server()

# Goal(Destination) setting
# Need to implement user-input reading and modify positions accordingly
goal = MoveBaseGoal()
goal.target_pose.header.frame_id = "map"
goal.target_pose.header.stamp = rospy.Time.now()

# Set destination goals
#set_goal_pose(goal, 0.5, 0.5, 0.0)
set_goal_pose(goal, dest_pose_x - 0.3, dest_pose_y - 0.3, 0.0)
set_goal_orientation(goal, 0.0, 0.0, 0.662, 0.750)

# Send the destination location
navclient.send_goal(goal, done_cb, active_cb, feedback_cb)
finished = navclient.wait_for_result()

if not finished:
    rospy.logerr("Action server not available!")
else:
    rospy.loginfo ( navclient.get_result())

