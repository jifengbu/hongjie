package plugins;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

import org.apache.cordova.api.CallbackContext;
import org.apache.cordova.api.CordovaPlugin;
import org.apache.cordova.api.PluginResult;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import com.hongjie.mrp.MainActivity;

import plugins.Zxing.CaptureActivity;
import plugins.folder.MyFileManager;
import plugins.service.ServerPushService;
import android.app.Activity;
import android.app.AlarmManager;
import android.app.DatePickerDialog;
import android.app.PendingIntent;
import android.content.Context;
import android.content.DialogInterface;
import android.content.SharedPreferences;
import android.content.DialogInterface.OnKeyListener;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.util.Base64;
import android.util.Log;
import android.view.KeyEvent;
import android.widget.DatePicker;
import android.widget.Toast;

/**
 * This class echoes a string called from JavaScript.
 */
public class UtilsPlugin extends CordovaPlugin {
	private static final String LOG_TAG = MainActivity.LOG_TAG;
	private static final int ACTIVITY_RESULT_SCANNER = 1;
	private static final int ACTIVITY_RESULT_FOLDER = 2;
	private CallbackContext callbackContext;

	@Override
	public boolean execute(String action, JSONArray args,
			CallbackContext callbackContext) throws JSONException {
		this.callbackContext = callbackContext;
		if (action.equals("unzip")) {
			String zipFile = args.getString(0);
			String outPath = args.getString(1);
			int winWidth = Integer.parseInt(args.getString(2));
			int winHeight = Integer.parseInt(args.getString(3));
			unzipFolderAsync(zipFile, outPath, winWidth, winHeight);
			return true;
		}
		if (action.equals("callNumber")) {
			final String number = args.getString(0);
			String numberUri = "tel:" + number.toString().trim();
			Intent callIntent = new Intent(Intent.ACTION_CALL,
					Uri.parse(numberUri));
			cordova.getActivity().startActivity(callIntent);
			return true;
		}

		if (action.equals("sendSms")) {
			final String number = args.getString(0);
			String numberUri = "smsto:" + number.toString().trim();
			Intent callIntent = new Intent(Intent.ACTION_SENDTO,
					Uri.parse(numberUri));
			callIntent.putExtra("sms_body", "");
			cordova.getActivity().startActivity(callIntent);
			return true;
		}

		if (action.equals("genScreenCss")) {
			String cssPath = args.getString(0);
			String cssfile = args.getString(1);
			int winWidth = Integer.parseInt(args.getString(2));
			int winHeight = Integer.parseInt(args.getString(3));
			genScreenCss(cssPath, cssfile, winWidth, winHeight);
			return true;
		}

		if (action.equals("getLocalValue")) {
			String tag = args.getString(0);
			getLocalValue(tag);
			return true;
		}

		if (action.equals("setLocalValue")) {
			String tag = args.getString(0);
			String value = args.getString(1);
			setLocalValue(tag, value);
			return true;
		}

		if (action.equals("restart")) {
			restartActivity();
			return true;
		}
		
		if (action.equals("installApk")) {
			String apkFile = args.getString(0);
			installApk(apkFile);
			return true;
		}

		if (action.equals("toast")) {
			String info = args.getString(0);
			Toast.makeText(cordova.getActivity(), info, Toast.LENGTH_SHORT)
					.show();
			return true;
		}

		if (action.equals("datePickerDialog")) {
			int year = Integer.parseInt(args.getString(0));
			int month = Integer.parseInt(args.getString(1));
			int day = Integer.parseInt(args.getString(2));
			datePickerDialog(year, month, day);
			return true;
		}

		if (action.equals("scanner")) {
			showSannerActivity();
			return true;
		}

		if (action.equals("getAppInfo")) {
			getAppInfo();
			return true;
		}
		
		if (action.equals("readFile")) {
			String filename = args.getString(0);
			String type = args.getString(1);
			readFile(filename, type);
			return true;
		}
		
		if (action.equals("writeFile")) {
			String filename = args.getString(0);
			String type = args.getString(1);
			String data = args.getString(2);
			writeFile(filename, type, data);
			return true;
		}
		
		if (action.equals("chooseFile")) {
            chooseFile(args.getString(0), args.getInt(1));
            return true;
        }
		
		if (action.equals("addNotification")) {
			MainActivity activity = (MainActivity) cordova.getActivity();
			if (activity.msgService != null) {
				activity.msgService.addNotification(args.getInt(0), args.getString(1), args.getString(2));
			}
            return true;
        }
		
		if (action.equals("clearNotification")) {
			MainActivity activity = (MainActivity) cordova.getActivity();
			if (activity.msgService != null) {
				activity.msgService.clearNotification(args.getInt(0));
			}
            return true;
        }

		return false;
	}

	public void getLocalValue(String tag) {
		MainActivity activity = (MainActivity) cordova.getActivity();
		String ret = activity.settings.getString(tag, "");
		Log.v(LOG_TAG, "getLocalValue value=" + ret + "  tag=" + tag);
		callbackContext.success(ret);
	}

	public void setLocalValue(String tag, String value) {
		MainActivity activity = (MainActivity) cordova.getActivity();
		SharedPreferences.Editor edit = activity.settings.edit();
		Log.v(LOG_TAG, "setLocalValue value=" + value + "  tag=" + tag);
		edit.putString(tag, value);
		edit.commit();
	}

	public void showSannerActivity() {
		Intent intent = new Intent().setClass(cordova.getActivity(),
				CaptureActivity.class);
		cordova.startActivityForResult(this, intent, ACTIVITY_RESULT_SCANNER);
		// 下面三句为cordova插件回调页面的逻辑代码
		PluginResult mPlugin = new PluginResult(PluginResult.Status.NO_RESULT);
		mPlugin.setKeepCallback(true);
		callbackContext.sendPluginResult(mPlugin);
	}

	public void chooseFile(String startdir, int type) throws JSONException {
		Intent intent = new Intent().setClass(cordova.getActivity(), MyFileManager.class);
		intent.putExtra("startdir", startdir);
		intent.putExtra("type", type);
        cordova.startActivityForResult(this, intent, ACTIVITY_RESULT_FOLDER);   
    }
	
	@Override
	public void onActivityResult(int requestCode, int resultCode, Intent intent) {
		if (requestCode == ACTIVITY_RESULT_SCANNER) {
			try {
				onScannerResult(resultCode, intent);
			} catch (JSONException e) {
				e.printStackTrace();
			}
		} else if (requestCode == ACTIVITY_RESULT_FOLDER) {
			try {
				Bundle b = intent.getExtras();
				String text = b.getString("file");
				callbackContext.success(text);
			} catch (Exception e) {
				callbackContext.error(-1);
			}
		} 
	}

	private void onScannerResult(int resultCode, Intent intent)
			throws JSONException {
		JSONObject obj = new JSONObject();
		switch (resultCode) {
		case Activity.RESULT_OK:
			Bundle b = intent.getExtras();
			String text = b.getString("text");
			// String image = b.getString("image");
			obj.put("state", "success");
			obj.put("text", text);
			// obj.put("image", image);
			break;
		default:
			obj.put("state", "cancel");
			break;
		}
		callbackContext.success(obj);
	}
	
	public void datePickerDialog(int year, int month, int day) {
		DatePickerDialog.OnDateSetListener onDateSetListener = new DatePickerDialog.OnDateSetListener() {
			@Override
			public void onDateSet(DatePicker view, int year, int month, int day) {
				JSONObject obj = new JSONObject();
				try {
					obj.put("year", year);
					obj.put("month", month + 1);
					obj.put("day", day);
				} catch (JSONException e) {
					e.printStackTrace();
				}
				callbackContext.success(obj);
			}
		};
		final DatePickerDialog dialog = new DatePickerDialog(
				cordova.getActivity(), onDateSetListener, year, month - 1, day);
		dialog.setButton(DialogInterface.BUTTON_NEGATIVE, "Cancel",
				new DialogInterface.OnClickListener() {
					public void onClick(DialogInterface d, int which) {
						if (which == DialogInterface.BUTTON_NEGATIVE) {
							callbackContext.error(-1);
							dialog.dismiss();
						}
					}
				});
		dialog.setOnKeyListener(new OnKeyListener() {
			@Override
			public boolean onKey(DialogInterface arg0, int arg1, KeyEvent arg2) {
				if (arg1 == KeyEvent.KEYCODE_BACK) {
					callbackContext.error(-1);
					dialog.dismiss();
				}
				return false;
			}
		});
		dialog.show();
	}

	public void readFile(String filename, String type) {
		File file = new File(filename);  
        try {  
        		int length = (int) file.length();
        		byte[] buf = new byte[length];
        		FileInputStream in = new FileInputStream(file);
        		in.read(buf);
        		String value = new String( (type.equals("base64")) ? Base64.encode(buf, Base64.DEFAULT) : buf);
			in.close();
			callbackContext.success(value);
        } catch (Exception e) {
			e.printStackTrace();
			callbackContext.error(-1);
		}
	}
	
	public void writeFile(String filename, String type, String data) {
		File file = new File(filename); 
		byte[] buf = (type.equals("base64"))? Base64.decode(data.getBytes(), Base64.DEFAULT) : data.getBytes();
		int len = buf.length;
        try {  
        		FileOutputStream out = new FileOutputStream(file);
			out.write(buf, 0, len);
			out.flush();
			out.close();
			callbackContext.success(len);
        } catch (Exception e) {
			e.printStackTrace();
			callbackContext.error(-1);
		}
	}
	
	public void installApk(String apkFile) {
		Intent intent = new Intent(Intent.ACTION_VIEW);
		intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
		intent.setDataAndType(Uri.fromFile(new File(apkFile)),
				"application/vnd.android.package-archive");
		cordova.getActivity().startActivity(intent);
	}

	public void restartActivity() {
		Intent intent = new Intent();
		intent.setClassName(cordova.getActivity().getPackageName(),
				"com.hongjie.mrp.MainActivity");
		PendingIntent restartIntent = PendingIntent.getActivity(cordova
				.getActivity().getApplicationContext(), 0, intent,
				Intent.FLAG_ACTIVITY_NEW_TASK);
		AlarmManager mgr = (AlarmManager) cordova.getActivity()
				.getSystemService(Context.ALARM_SERVICE);
		mgr.set(AlarmManager.RTC, System.currentTimeMillis() + 100,
				restartIntent);
		cordova.getActivity().finish();
		android.os.Process.killProcess(android.os.Process.myPid());
	}

	public void getAppInfo() {
		JSONObject obj = new JSONObject();
		try {
			obj.put("documentPath", MainActivity.documentPath);
			obj.put("maxVersion", MainActivity.versionCode);
		} catch (JSONException e) {
			callbackContext.error(-1);
		}
		callbackContext.success(obj);
	}

	public void unzipFolderAsync(final String zipFile, final String outPath,
			final int winWidth, final int winHeight) {
		final PluginResult pluginResult = new PluginResult(
				PluginResult.Status.OK, "start");
		pluginResult.setKeepCallback(true);
		callbackContext.sendPluginResult(pluginResult);

		final MainActivity activity = (MainActivity) cordova.getActivity();
		Thread unzipThread = new Thread(new Runnable() {
			public void run() {
				try {
					unzipFolder(zipFile, outPath, winWidth, winHeight);
					activity.delFile(zipFile);
					PluginResult pluginResult = new PluginResult(
							PluginResult.Status.OK, "finish");
					callbackContext.sendPluginResult(pluginResult);
				} catch (Exception e) {
					e.printStackTrace();
					PluginResult pluginResult = new PluginResult(
							PluginResult.Status.ERROR, "error");
					callbackContext.sendPluginResult(pluginResult);
				}
			}
		});
		unzipThread.start();
	}

	public void unzipFolder(String zipFile, String outPath, int winWidth,
			int winHeight) throws Exception {
		Log.v(LOG_TAG, "start unzip " + zipFile + " to " + outPath);
		ZipInputStream inZip = new ZipInputStream(new FileInputStream(zipFile));
		ZipEntry zipEntry;
		String szName = "";

		final MainActivity activity = (MainActivity) cordova.getActivity();
		while ((zipEntry = inZip.getNextEntry()) != null) {
			szName = zipEntry.getName();

			String fullName = outPath + File.separator + szName;
			if (zipEntry.isDirectory()) {
				// get the folder name of the widget
				szName = szName.substring(0, szName.length() - 1);
				File folder = new File(fullName);
				Log.v(LOG_TAG, "mkdirs " + fullName);
				folder.mkdirs();
			} else {
				File file = new File(fullName);
				Log.v(LOG_TAG, "start unzip " + file.getAbsolutePath());
				file.createNewFile();
				// get the output stream of the file
				FileOutputStream out = new FileOutputStream(file);
				if ("less".equals(activity.getExtensionName(szName))) {
					String config = "";
					config += "@winWidth:" + winWidth + ";";
					config += "@winHeight:" + winHeight + ";";
					out.write(config.getBytes());
				}
				int len;
				byte[] buffer = new byte[1024];
				// read (len) bytes into buffer
				while ((len = inZip.read(buffer)) != -1) {
					// write (len) byte from buffer at the position 0
					out.write(buffer, 0, len);
					out.flush();
				}
				out.close();
				if ("less".equals(activity.getExtensionName(szName))) {
					String cssfile = outPath + File.separator
							+ activity.getFileNameNoEx(szName) + ".css";
					Log.v(LOG_TAG, "less2css : from " + fullName + " to "
							+ cssfile);
					MainActivity.less2css(fullName, cssfile, false);
				}
			}
		}// end of while
		inZip.close();
	}// end of func

	public void genScreenCss(String cssPath, String cssfile, int winWidth,
			int winHeight) {
		Log.v(LOG_TAG, "genScreenCss in java: cssPath:" + cssPath + "   cssfile:"
				+ cssfile+ "needGenScreenCss:" + MainActivity.needGenScreenCss);
		if (MainActivity.needGenScreenCss) {
			Log.v(LOG_TAG, "do genScreenCss in java: cssPath:" + cssPath
					+ "  cssfile:" + cssfile);
			File folder = new File(cssPath);
			folder.mkdirs();
			genCssFileFromAssert("www/www/modules/style/screen.less", cssPath
					+ cssfile, winWidth, winHeight);
		}
	}

	private void genCssFileFromAssert(String assetsFile, String cssFile,
			int winWidth, int winHeight) {
		String lessFile = MainActivity.documentPath + "temp.less";
		copyFileFromAssetsToData(assetsFile, lessFile, winWidth, winHeight);
		MainActivity.less2css(lessFile, cssFile, false);

		File file = new File(lessFile);
		if (file.exists()) {
			file.delete();
		}
		
//		int len;
//		byte[] buf = new byte[1024];
//		File cfile = new File(cssFile);  
//        FileInputStream in = null;   
//        try {  
//             in = new FileInputStream(cfile);
//	        while ((len = in.read(buf)) > 0) {
//	        		String value = new String(buf);
//				Log.v("fang", value);
//			}
//			in.close();
//        } catch (Exception e) {
//			e.printStackTrace();
//		}
	}

	private void copyFileFromAssetsToData(String assetsFile, String dataFile,
			int winWidth, int winHeight) {
		InputStream in = null;
		FileOutputStream out = null;
		MainActivity activity = (MainActivity) cordova.getActivity();

		try {
			in = activity.getAssets().open(assetsFile);
			out = new FileOutputStream(dataFile);

			String config = "";
			config += "@winWidth:" + winWidth + ";";
			config += "@winHeight:" + winHeight + ";";
			out.write(config.getBytes());

			int length = -1;
			byte[] buf = new byte[1024];
			while ((length = in.read(buf)) != -1) {
				out.write(buf, 0, length);
			}
			out.flush();
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			if (in != null) {
				try {
					in.close();
				} catch (IOException e1) {
					e1.printStackTrace();
				}
			}
			if (out != null) {
				try {
					out.close();
				} catch (IOException e1) {
					e1.printStackTrace();
				}
			}
		}
	}
}
