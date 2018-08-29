for f in *.mp4; do
    </dev/null ffmpeg -i "$f" -i "${f%.*}.srt" -vcodec libx264 -crf 28 -vf scale=-2:480 -acodec aac -ab 128k -ac 2 "/home/erik/Videos/The League/${f:0:17}.mkv";
done
