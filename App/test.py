import subprocess

rel_goal_pose_x = 10
rel_goal_pose_y = 15
a = str(rel_goal_pose_x) + ' '+ str(rel_goal_pose_y)
subprocess.run(["python3", "../auto_nav/scripts/goal_pose.py"], input=a.encode('utf-8'))
