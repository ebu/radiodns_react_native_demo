package com.radiodns.notificationControl;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.Color;
import android.os.Build;
import android.support.annotation.RequiresApi;
import android.support.v4.app.NotificationCompat;
import android.support.v4.content.ContextCompat;
import android.support.v4.media.app.NotificationCompat.MediaStyle;
import android.util.Log;

import com.bumptech.glide.Glide;
import com.bumptech.glide.request.FutureTarget;
import com.radiodns.MainActivity;
import com.radiodns.R;
import com.radiodns.StateUpdatesMessages;

import java.util.concurrent.ExecutionException;


/**
 * Class to build and update a media controls notification.
 */
public class MediaNotificationManager {

    public static final int NOTIFICATION_ID = 413;

    private static final String TAG = MediaNotificationManager.class.getSimpleName();
    private static final String CHANNEL_ID = "com.radiodns.channel";

    private final NotificationCompat.Action mPlayAction;
    private final NotificationCompat.Action mPauseAction;
    private final NotificationCompat.Action mNextAction;
    private final NotificationCompat.Action mPrevAction;
    private final NotificationManager notificationManager;
    private final Context context;

    public MediaNotificationManager(Context context) {
        this.context = context;

        notificationManager =
                (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);

        mPlayAction =
                new NotificationCompat.Action(
                        R.drawable.ic_play_arrow_white_24dp,
                        context.getString(R.string.label_play),
                        this.generateNotifControlIntent(StateUpdatesMessages.PLAY));
        mPauseAction =
                new NotificationCompat.Action(
                        R.drawable.ic_pause_white_24dp,
                        context.getString(R.string.label_pause),
                        this.generateNotifControlIntent(StateUpdatesMessages.PAUSE));
        mNextAction =
                new NotificationCompat.Action(
                        R.drawable.ic_skip_next_white_24dp,
                        context.getString(R.string.label_next),
                        this.generateNotifControlIntent(StateUpdatesMessages.NEXT));
        mPrevAction =
                new NotificationCompat.Action(
                        R.drawable.ic_skip_previous_white_24dp,
                        context.getString(R.string.label_previous),
                        this.generateNotifControlIntent(StateUpdatesMessages.PREVIOUS));

        // Cancel all notifications to handle the case where the Service was killed and
        // restarted by the system.
        notificationManager.cancelAll();
    }

    /**
     * Builds and display a notification. If the notification was already shown, updates it.
     *
     * The notification responds to user interaction with the following intents:
     * - Action: [StateUpdatesMessages.PLAY] on play button pressed.
     * - Action: [StateUpdatesMessages.PAUSE] on pause button pressed.
     * - Action: [StateUpdatesMessages.NEXT] on NEXT button pressed.
     * - Action: [StateUpdatesMessages.PREVIOUS] on play PREVIOUS pressed.
     * - Action: [MainActivity.class] on pressing on the notification.
     * - Action: [StateUpdatesMessages.STOP] on dismissing the notification from the notification center.
     *
     * @param title: The title of the notification.
     * @param subtitle: The smaller text under the title of the notification.
     * @param imgUrl: The image art url of the currently played station/song/stream.
     * @param playing: If the media is currently playing.
     */
    public void buildNotification(String title, String subtitle, String imgUrl, boolean playing) {

        // Create the (mandatory) notification channel when running on Android Oreo.
        if (isAndroidOOrHigher()) {
            createChannel();
        }

        // Create intent to start main activity.
        Intent activityIntent = new Intent(context, MainActivity.class);
        activityIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

        NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_ID);
        builder.setColor(ContextCompat.getColor(context, R.color.notification_bg))
                .setSmallIcon(R.drawable.ic_stat_image_audiotrack)
                .setContentTitle(title)
                // Setting intent to broadcast when pressing on the notification.
                .setContentIntent(PendingIntent.getActivity(context, 0, activityIntent, PendingIntent.FLAG_CANCEL_CURRENT))
                // Setting intent to broadcast when the notification was dismissed.
                .setDeleteIntent(this.generateNotifControlIntent(StateUpdatesMessages.STOP))
                .setContentText(subtitle)
                // Show controls on lock screen even when user hides sensitive content.
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                .setStyle(new MediaStyle()
                        // Show control buttons even in compact mode.
                        .setShowActionsInCompactView(0, 1, 2)
                        .setCancelButtonIntent(this.generateNotifControlIntent(StateUpdatesMessages.STOP))
                )
                // Add action buttons.
                .addAction(mPrevAction)
                .addAction(playing ? mPauseAction : mPlayAction)
                .addAction(mNextAction);

        FutureTarget<Bitmap> futureTarget = Glide.with(context)
                .asBitmap()
                .load(imgUrl)
                .submit();

        try {
            builder.setLargeIcon(futureTarget.get());
        } catch (InterruptedException e) {
            e.printStackTrace();
        } catch (ExecutionException e) {
            e.printStackTrace();
        }

        notificationManager.notify(MediaNotificationManager.NOTIFICATION_ID, builder.build());
    }

    /**
     * Returns the notification manager used to display this notification. This is usefull if you want
     * to cancel this notification.
     * @return
     */
    public NotificationManager getNotificationManager() {
        return notificationManager;
    }

    /**
     * After android O one must create a channel for its notifications.
     */
    @RequiresApi(Build.VERSION_CODES.O)
    private void createChannel() {
        if (notificationManager.getNotificationChannel(CHANNEL_ID) == null) {
            CharSequence name = context.getString(R.string.notif_channel_name);
            String description = context.getString(R.string.notif_channel_desc);
            int importance = NotificationManager.IMPORTANCE_DEFAULT;
            NotificationChannel channel = new NotificationChannel(CHANNEL_ID, name, importance);
            channel.setDescription(description);
            channel.enableLights(true);
            // Sets the notification light color for notifications posted to this
            // channel, if the device supports this feature.
            channel.setLightColor(Color.BLUE);
            channel.enableVibration(true);
            channel.setVibrationPattern(
                    new long[]{100, 200, 300, 400, 500, 400, 300, 200, 400});
            notificationManager.createNotificationChannel(channel);
            Log.d(TAG, "createChannel: New channel created");
        } else {
            Log.d(TAG, "createChannel: Existing channel reused");
        }
    }

    /**
     * Returns true if the Android running on this phone is higher than android O. False otherwise.
     * @return
     */
    private boolean isAndroidOOrHigher() {
        return Build.VERSION.SDK_INT >= Build.VERSION_CODES.O;
    }

    /**
     * Generate a pending intent that will broadcast a playback control message.
     * @param action: The playback control message.
     * @return the pending intent.
     */
    private PendingIntent generateNotifControlIntent (String action) {
        Intent i = new Intent();
        i.setAction(action);
        return PendingIntent.getBroadcast(context, 0, i, 0);
    }
}