#!/bin/sh

# HandBrakeCLI -i ./srcvideo/Blackboard.mp4 -o ./video/Blackboard.mp4 --preset="Normal" -q 22 -l 320 --gain 10 -ab 64k -ac 1 --encopts="min-keyint=40:keyint=40"
HandBrakeCLI -i ./srcvideo/Selenographia.mp4 -o ./video/Selenographia.mp4 --preset="Normal" -q 20 -l 850 --gain 10 -ab 64k -ac 1 --encopts="min-keyint=40:keyint=40"
HandBrakeCLI -i ./srcvideo/TraverseBoard_final.mp4 -o ./video/TraverseBoard_final.mp4 --preset="Normal" -q 20 -l 850 --gain 10 -ab 64k -ac 1 --encopts="min-keyint=40:keyint=40"

# ffmpeg -y -i audiosrc/armillary/armillary1_time_motion.mp3 -acodec mp3 -ab 64 -ac 1 audio/armillary/armillary1_time_motion.mp3
# ffmpeg -y -i audiosrc/armillary/armillary2_telltime.mp3 -acodec mp3 -ab 64k -ac 1 audio/armillary/armillary2_telltime.mp3
# ffmpeg -y -i audiosrc/armillary/armillary3_janvier.mp3 -acodec mp3 -ab 64k -ac 1 audio/armillary/armillary3_janvier.mp3
# 
# ffmpeg -y -i audiosrc/blackboard/blackboard1_writing.mp3 -acodec mp3 -ab 64k -ac 1 audio/blackboard/blackboard1_writing.mp3
# ffmpeg -y -i audiosrc/blackboard/blackboard2_morethan.mp3 -acodec mp3 -ab 64k -ac 1 audio/blackboard/blackboard2_morethan.mp3
# ffmpeg -y -i audiosrc/blackboard/blackboard3_lectures.mp3 -acodec mp3 -ab 64k -ac 1 audio/blackboard/blackboard3_lectures.mp3
# 
# ffmpeg -y -i audiosrc/globe/globe1_changing.mp3 -acodec mp3 -ab 64k -ac 1 audio/globe/globe1_changing.mp3
# ffmpeg -y -i audiosrc/globe/globe2_heaven.mp3 -acodec mp3 -ab 64k -ac 1 audio/globe/globe2_heaven.mp3
# 
# ffmpeg -y -i audiosrc/lodestone/lodestone1_what.mp3 -acodec mp3 -ab 64k -ac 1 audio/lodestone/lodestone1_what.mp3
# ffmpeg -y -i audiosrc/lodestone/lodestone2_whatfor.mp3 -acodec mp3 -ab 64k -ac 1 audio/lodestone/lodestone2_whatfor.mp3
# ffmpeg -y -i audiosrc/lodestone/lodestone3_countess.mp3 -acodec mp3 -ab 64k -ac 1 audio/lodestone/lodestone3_countess.mp3
# 
# ffmpeg -y -i audiosrc/marconi/marconi1_magicbox.mp3 -acodec mp3 -ab 100k -ac 1 audio/marconi/marconi1_magicbox.mp3
# ffmpeg -y -i audiosrc/marconi/marconi2_whatsinthebox.mp3 -acodec mp3 -ab 64k -ac 1 audio/marconi/marconi2_whatsinthebox.mp3
# ffmpeg -y -i audiosrc/marconi/marconi3_whowasmarconi.mp3 -acodec mp3 -ab 64k -ac 1 audio/marconi/marconi3_whowasmarconi.mp3
# 
# ffmpeg -y -i audiosrc/moon_globe/moon_globe1_motions.mp3 -acodec mp3 -ab 64k -ac 1 audio/moon_globe/moon_globe1_motions.mp3
# ffmpeg -y -i audiosrc/moon_globe/moon_globe2_johnrussel.mp3 -acodec mp3 -ab 64k -ac 1 audio/moon_globe/moon_globe2_johnrussel.mp3
# ffmpeg -y -i audiosrc/moon_globe/moon_globe3_tiny.mp3 -acodec mp3 -ab 64k -ac 1 audio/moon_globe/moon_globe3_tiny.mp3
# 
# ffmpeg -y -i audiosrc/navigation/navigation1_angles.mp3 -acodec mp3 -ab 64k -ac 1 audio/navigation/navigation1_angles.mp3
# ffmpeg -y -i audiosrc/navigation/navigation_edit.mp3 -acodec mp3 -ab 64k -ac 1 audio/navigation/navigation2_art.mp3
