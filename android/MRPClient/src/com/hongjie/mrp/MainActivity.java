package com.hongjie.mrp;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

import android.app.Activity;
import android.app.Notification;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.content.SharedPreferences;
import android.content.pm.PackageManager.NameNotFoundException;
import android.os.Bundle;
import android.os.IBinder;
import android.util.Log;

import org.apache.cordova.*;

import plugins.service.ServerPushService;

public class MainActivity extends DroidGap {
	public static final String LOG_TAG = "fang";
	public static final String PACKAGE_NAME = "com.hongjie.mrp";
	public static final String PREF_LOCAL_STORAGE = "PREF_LOCAL_STORAGE";
	public static boolean needGenScreenCss = false;
	public static int versionCode = 0;
	public static String documentPath = "/data/data/com.hongjie.mrp/files/";

	public ServerPushService msgService = null;
	public SharedPreferences settings;

	public native static boolean less2css(String lessfile, String cssfile,
			boolean format);

	static {
		System.loadLibrary("clessc");
	}
	
	ServiceConnection conn = new ServiceConnection() { 
		@Override
		public void onServiceConnected(ComponentName name, IBinder service) {
			// TODO Auto-generated method stub
			//返回一个ServerPushService对象  
			Log.v(LOG_TAG, "enter ServerPushService onServiceConnected");
			msgService = ((ServerPushService.IMsgBinder)service).getService(); 
		}

		@Override
		public void onServiceDisconnected(ComponentName name) {
			// TODO Auto-generated method stub
			Log.v(LOG_TAG, "enter ServerPushService onServiceDisconnected");
			msgService = null;
		}  
    }; 
	

	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		
		super.splashscreen = R.drawable.splash;
		super.showSplashScreen(1000000);

		this.startService(new Intent(this, ServerPushService.class));
		Intent intent = new Intent("com.hongjie.mrp.MSG_ACTION");  
        bindService(intent, conn, Context.BIND_AUTO_CREATE);  

		needGenScreenCss = false;
		settings = getSharedPreferences(PREF_LOCAL_STORAGE,
				Activity.MODE_PRIVATE);
		try {
			versionCode = getPackageManager().getPackageInfo(PACKAGE_NAME, 0).versionCode-10000;
		} catch (NameNotFoundException e) {
		}

		documentPath = getFilesDir() + "/";
		Log.v(LOG_TAG, "[install]:versionCode:" + versionCode);
		Log.v(LOG_TAG, "[install]:documentPath:" + documentPath);
		
		File wwwfolder = new File(documentPath+"www");
		String lastversionCode = settings.getString("APK_VERSION_CODE", "0");
		if (!lastversionCode.equals("" + versionCode)|| !wwwfolder.exists()) {
			SharedPreferences.Editor edit = settings.edit();
			edit.putString("APK_VERSION_CODE", "" + versionCode);
			edit.commit();
			new Thread(new Runnable() {
				@Override
				public void run() {
					Log.v(LOG_TAG, "[install]:java need copy www dir");
					String path = documentPath + "www/";
					delAllFile(path);
					copyAssets("www/www", path);
					runOnUiThread(new Runnable() {
						@Override
						public void run() {
							loadUrl(Config.getStartUrl());
						}
					});
				}
			}).start();
			needGenScreenCss = true;
		} else {
			Log.v(LOG_TAG, "[install]:java not need copy www dir");
			loadUrl(Config.getStartUrl());
		}
	}
	
	public void onDestroy() {
        super.onDestroy();
        this.unbindService(conn);
        Log.v("LOG_TAG", "onDestroy");
    }
	
	public void emptyFolder(String path) {
		File file = new File(path);
		if (!file.exists()) {
			Log.v(LOG_TAG, "makdir " + file.getAbsolutePath());
			file.mkdir();
		} else {
			delAllFile(path);
		}
	}

	public void delFile(String filePath) {
		Log.v(LOG_TAG, "delete zip file: " + filePath);
		File file = new File(filePath);
		file.delete();
	}

	public void delFolder(String folderPath) {
		try {
			delAllFile(folderPath); // 删除完里面所有内容
			String filePath = folderPath;
			filePath = filePath.toString();
			File myFilePath = new File(filePath);
			myFilePath.delete(); // 删除空文件夹
		} catch (Exception e) {
			System.out.println("删除文件夹操作出错");
			e.printStackTrace();
		}
	}

	public void delAllFile(String path) {
		File file = new File(path);
		if (!file.exists()) {
			return;
		}
		if (!file.isDirectory()) {
			return;
		}
		String[] tempList = file.list();
		File temp = null;
		for (int i = 0; i < tempList.length; i++) {
			if (path.endsWith(File.separator)) {
				temp = new File(path + tempList[i]);
			} else {
				temp = new File(path + File.separator + tempList[i]);
			}
			if (temp.isFile()) {
				temp.delete();
				Log.v(LOG_TAG, "delete file: " + temp.getAbsolutePath());
			}
			if (temp.isDirectory()) {
				delAllFile(path + "/" + tempList[i]);// 先删除文件夹里面的文件
				delFolder(path + "/" + tempList[i]);// 再删除空文件夹
				Log.v(LOG_TAG, "delete folder: " + path + "/" + tempList[i]);
			}
		}
	}

	/*
	 * Java文件操作 获取文件扩展名
	 */
	public String getExtensionName(String filename) {
		if ((filename != null) && (filename.length() > 0)) {
			int dot = filename.lastIndexOf('.');
			if ((dot > -1) && (dot < (filename.length() - 1))) {
				return filename.substring(dot + 1);
			}
		}
		return filename;
	}

	/*
	 * Java文件操作 获取不带扩展名的文件名
	 */
	public String getFileNameNoEx(String filename) {
		if ((filename != null) && (filename.length() > 0)) {
			int dot = filename.lastIndexOf('.');
			if ((dot > -1) && (dot < (filename.length()))) {
				return filename.substring(0, dot);
			}
		}
		return filename;
	}

	public void copyAssets(String assetDir, String dir) {
		String[] files;
		int len;
		InputStream in;
		OutputStream out;
		byte[] buf = new byte[1024];
		
		try {
			files = getAssets().list(assetDir);
		} catch (IOException e1) {
			return;
		}
		File path = new File(dir);
		if (!path.exists()) {
			if (!path.mkdirs()) {
				return;
			}
		}

		for (int i = 0; i < files.length; i++) {
			String fileName = files[i];
			String fullAssetsPath = ((0==assetDir.length())?"":assetDir + "/") + fileName;
			String fullDataPath = dir + fileName + "/";
			try {
				in = getAssets().open(fullAssetsPath);
			} catch (Exception e) {
				copyAssets(fullAssetsPath, fullDataPath);
				continue;
			}
			File outFile = new File(path, fileName);
			if (outFile.exists()) {
				outFile.delete();
			}
			try {
				out = new FileOutputStream(outFile);
				while ((len = in.read(buf)) > 0) {
					out.write(buf, 0, len);
				}
				in.close();
				out.close();
			} catch (Exception e) {
				e.printStackTrace();
			}
		}
	}
}
