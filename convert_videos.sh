#!/bin/sh

HandBrakeCLI -i ./srcvideo/Blackboard.mp4 -o ./video/Blackboard.mp4 --preset="Normal" -q 20 -l 320 --gain 10 --encopts="min-keyint=40:keyint=40"
# HandBrakeCLI -i ./srcvideo/Selenographia.mp4 -o ./video/Selenographia.mp4 --preset="Normal" -q 20 -l 568 --gain 10 --encopts="min-keyint=40:keyint=40"
# HandBrakeCLI -i ./srcvideo/TraverseBoard_final.mp4 -o ./video/TraverseBoard_final.mp4 --preset="Normal" -q 20 -l 568 --gain 10 --encopts="min-keyint=40:keyint=40"

ffmpeg -i audiosrc/armillary/armillary1_time_motion.mp3 -acodec mp3 -ab 100k audio/armillary1_time_motion.mp3
ffmpeg -i audio/armillary/armillary2.mp3 -acodec mp3 -ab 100k audio/armillary100.mp3
ffmpeg -i audio/armillary/armillary1_time_motion.mp3 -acodec mp3 -ab 100k audio/armillary100.mp3
ffmpeg -i audio/armillary/armillary1_time_motion.mp3 -acodec mp3 -ab 100k audio/armillary100.mp3
