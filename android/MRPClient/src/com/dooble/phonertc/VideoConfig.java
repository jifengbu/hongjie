package com.dooble.phonertc;

import org.json.JSONException;
import org.json.JSONObject;

import android.util.Log;

public class VideoConfig {
	
	private VideoLayoutParams _remoteRegion;
	private VideoLayoutParams _localRegion;
	private VideoLayoutParams _container;
	private int _devicePixelRatio;
	
	public VideoLayoutParams getRemoteRegion() {
		return _remoteRegion;
	}

	public void setRemoteRegion(VideoLayoutParams _remoteRegion) {
		this._remoteRegion = _remoteRegion;
	}
	
	public VideoLayoutParams getLocalRegion() {
		return _localRegion;
	}
	
	public void setLocalRegion(VideoLayoutParams _localRegion) {
		this._localRegion = _localRegion;
	}
	
	public VideoLayoutParams getContainer() {
		return _container;
	}

	public void setContainer(VideoLayoutParams _container) {
		this._container = _container;
	}
	
	public int getDevicePixelRatio() {
		return _devicePixelRatio;
	}

	public void setDevicePixelRatio(int _devicePixelRatio) {
		this._devicePixelRatio = _devicePixelRatio;
	}

	
	public static VideoConfig fromJSON(JSONObject json) throws JSONException {
		VideoConfig config = new VideoConfig();
		VideoLayoutParams localRegion = VideoLayoutParams.fromJSON(json.getJSONObject("localRegion"));
		VideoLayoutParams remoteRegion = VideoLayoutParams.fromJSON(json.getJSONObject("remoteRegion"));
		Log.v("fang", "localRegion "+localRegion.toString());
		Log.v("fang", "remoteRegion "+remoteRegion.toString());
		
		VideoLayoutParams largeRegion = localRegion;
		VideoLayoutParams smallRegion = remoteRegion;
		if (largeRegion.getWidth() < smallRegion.getWidth()) {
			VideoLayoutParams tmp = largeRegion;
			largeRegion = smallRegion;
			smallRegion = tmp;
		}

		VideoLayoutParams container = new VideoLayoutParams();
		container.setX(largeRegion.getX());
		container.setY(smallRegion.getY());
		int right1 = largeRegion.getX()+largeRegion.getWidth();
		int right2 = smallRegion.getX()+smallRegion.getWidth();
		int right = Math.max(right1, right2);
		container.setWidth(right-largeRegion.getX());
		container.setHeight(largeRegion.getHeight()+largeRegion.getY()-smallRegion.getY());
		config.setContainer(container);
		Log.v("fang", "container "+container.toString());
		
		if (localRegion.getWidth() > remoteRegion.getWidth()) {
			localRegion.setX(0);
			localRegion.setY(container.getHeight()-localRegion.getHeight());
			remoteRegion.setX(container.getWidth()-remoteRegion.getWidth());
			remoteRegion.setY(0);
		} else {
			localRegion.setX(container.getWidth()-localRegion.getWidth());
			localRegion.setY(0);
			remoteRegion.setX(0);
			remoteRegion.setY(container.getHeight()-remoteRegion.getHeight());
		}
		Log.v("fang", "localRegion "+localRegion.toString());
		Log.v("fang", "remoteRegion "+remoteRegion.toString());
		
		config.setLocalRegion(localRegion);
		config.setRemoteRegion(remoteRegion);
		
		config.setDevicePixelRatio(json.getInt("devicePixelRatio"));
		
		return config;
	}

	public static class VideoLayoutParams {
		private int _x;
		private int _y;
		private int _width;
		private int _height;
		
		public int getX() {
			return _x;
		}
		
		public void setX(int _x) {
			this._x = _x;
		}

		public int getY() {
			return _y;
		}

		public void setY(int _y) {
			this._y = _y;
		}

		public int getWidth() {
			return _width;
		}

		public void setWidth(int _width) {
			this._width = _width;
		}

		public int getHeight() {
			return _height;
		}

		public void setHeight(int _height) {
			this._height = _height;
		}
		
		public static VideoLayoutParams fromJSON(JSONObject json) throws JSONException {
			VideoLayoutParams params = new VideoLayoutParams();
			
			JSONObject position = json.getJSONObject("position");
			params.setX(position.getInt("x"));
			params.setY(position.getInt("y"));
			
			JSONObject size = json.getJSONObject("size");
			params.setWidth(size.getInt("width"));
			params.setHeight(size.getInt("height"));
			
			return params;
		}
		
		public String toString() {
			return _x+","+_y+","+_width+","+_height;
		}
	}
}
