package plugins.service;

import com.hongjie.mrp.MainActivity;
import com.hongjie.mrp.R;

import android.app.Notification;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.os.Binder;
import android.os.IBinder;
import android.util.Log;

public class ServerPushService extends Service {
	private PendingIntent pendingIntent = null;
	private Notification notification = null;
	private NotificationManager notificationManager = null;

	@Override
	public IBinder onBind(Intent intent) {
		Log.v("fang", "enter ServerPushService onBind");
		return new MsgBinder();
	}

	@Override
	public int onStartCommand(Intent intent, int flags, int startId) {
		Log.v("fang", "enter ServerPushService onStartCommand");
		// 初始化
		notification = new Notification();
		notification.icon = R.drawable.logo; // 通知图片
		notification.tickerText = "新消息"; // 通知标题
		notification.defaults = Notification.DEFAULT_SOUND;
		notification.flags = Notification.FLAG_AUTO_CANCEL;
		notificationManager = (NotificationManager) getSystemService(this.NOTIFICATION_SERVICE);
		// 点击查看
		Intent it = new Intent(this, MainActivity.class);
		it.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
		it.setAction(Intent.ACTION_MAIN);
		it.addCategory(Intent.CATEGORY_LAUNCHER);
		
		pendingIntent = PendingIntent.getActivity(this, 0, it.setFlags(Intent.FLAG_ACTIVITY_REORDER_TO_FRONT), PendingIntent.FLAG_CANCEL_CURRENT);
		return super.onStartCommand(intent, flags, startId);
	}

	public void addNotification(int id, String title, String msg) {
		Log.v("fang", "enter ServerPushService addNotification");
		notification.setLatestEventInfo(ServerPushService.this, title, msg,
				pendingIntent);
		notificationManager.notify(id, notification);
	}

	public void clearNotification(int id) {
		Log.v("fang", "enter ServerPushService clearNotification");
		if (id < 0) {
			notificationManager.cancelAll();
		} else {
			notificationManager.cancel(id);
		}
	}

	public interface IMsgBinder {
		public abstract ServerPushService getService();
	}

	public class MsgBinder extends Binder implements IMsgBinder {
		/**
		 * 获取当前ServerPushService的实例
		 * 
		 * @return
		 */
		public ServerPushService getService() {
			return ServerPushService.this;
		}
	}
}
