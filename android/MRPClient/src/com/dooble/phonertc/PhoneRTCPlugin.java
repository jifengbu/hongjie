package com.dooble.phonertc;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import android.app.Activity;
import android.graphics.PixelFormat;
import android.graphics.Point;
import android.opengl.GLES20;
import android.util.Log;
import android.view.View;
import android.webkit.WebView;

import org.apache.cordova.api.CallbackContext;
import org.apache.cordova.api.CordovaPlugin;
import org.apache.cordova.api.PluginResult;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.webrtc.AudioSource;
import org.webrtc.AudioTrack;
import org.webrtc.MediaConstraints;
import org.webrtc.PeerConnectionFactory;
import org.webrtc.VideoCapturer;
import org.webrtc.VideoRenderer;
import org.webrtc.VideoSource;
import org.webrtc.VideoTrack;

import com.dooble.phonertc.VideoRendererGuiEx;



public class PhoneRTCPlugin extends CordovaPlugin {
	private AudioSource _audioSource = null;
	private AudioTrack _audioTrack = null;

	private VideoCapturer _videoCapturer = null;
	private VideoSource _videoSource = null;
	
	private PeerConnectionFactory _peerConnectionFactory;
	private Map<String, Session> _sessions;
	
	private VideoConfig _videoConfig;
	private VideoGLView _videoView = null;
	private List<VideoTrackRendererPair> _remoteVideos;
	private VideoTrackRendererPair _localVideo = null;
	@SuppressWarnings("deprecation")
	private WebView.LayoutParams _videoParams;
	private boolean _shouldDispose = true;
	private boolean _initializedAndroidGlobals = false;
	public boolean _videoEnable = false;
	
	public PhoneRTCPlugin() {
		_remoteVideos = new ArrayList<VideoTrackRendererPair>();
		_sessions = new HashMap<String, Session>();
	}
	
	@Override
	public boolean execute(String action, JSONArray args,
			CallbackContext callbackContext) throws JSONException {

		final CallbackContext _callbackContext = callbackContext;
		
		if (action.equals("createSessionObject")) {		
			final SessionConfig config = SessionConfig.fromJSON(args.getJSONObject(1));
			this._videoEnable = config.isVideoStreamEnabled();
			final String sessionKey = args.getString(0);
			_callbackContext.sendPluginResult(getSessionKeyPluginResult(sessionKey));
			
			cordova.getActivity().runOnUiThread(new Runnable() {
				public void run() {					
					if (!_initializedAndroidGlobals) {
						abortUnless(PeerConnectionFactory.initializeAndroidGlobals(cordova.getActivity(), true, true, 
								VideoRendererGuiEx.getEGLContext()),
								"Failed to initializeAndroidGlobals");
						_initializedAndroidGlobals = true;
					}
					
					if (_peerConnectionFactory == null) {
						_peerConnectionFactory = new PeerConnectionFactory();
					}
					
					if (config.isAudioStreamEnabled() && _audioTrack == null) {
						initializeLocalAudioTrack();
					}
					
					if (config.isVideoStreamEnabled() && _localVideo == null) {		
						initializeLocalVideoTrack();
					}
					
					_sessions.put(sessionKey, new Session(PhoneRTCPlugin.this, 
							_callbackContext, config, sessionKey));
					
					if (_sessions.size() > 1) {
						_shouldDispose = false;
					}
				}
			});
			
			return true;
		} else if (action.equals("call")) {
			JSONObject container = args.getJSONObject(0);
			final String sessionKey = container.getString("sessionKey");
			
			cordova.getActivity().runOnUiThread(new Runnable() {
				public void run() {
					try {
						if (_sessions.containsKey(sessionKey)) {
							_sessions.get(sessionKey).call();
							_callbackContext.success();
						} else {
							_callbackContext.error("No session found matching the key: '" + sessionKey + "'");
						}
					} catch(Exception e) {
						_callbackContext.error(e.getMessage());
					}
				}
			});
			
			return true;
		} else if (action.equals("receiveMessage")) {
			JSONObject container = args.getJSONObject(0);
			final String sessionKey = container.getString("sessionKey");
			final String message = container.getString("message");

			cordova.getThreadPool().execute(new Runnable() {
				public void run() {
					_sessions.get(sessionKey).receiveMessage(message);
				}
			});

			return true;
		} else if (action.equals("renegotiate")) { 
			JSONObject container = args.getJSONObject(0);
			final String sessionKey = container.getString("sessionKey");
			final SessionConfig config = SessionConfig.fromJSON(container.getJSONObject("config"));	
			
			cordova.getActivity().runOnUiThread(new Runnable() {
				public void run() {
					Session session = _sessions.get(sessionKey);
					session.setConfig(config);
					session.createOrUpdateStream();
				}
			});
			
		} else if (action.equals("disconnect")) {
			JSONObject container = args.getJSONObject(0);
			final String sessionKey = container.getString("sessionKey");
			
			cordova.getActivity().runOnUiThread(new Runnable() {
				@Override
				public void run() {
					if (_sessions.containsKey(sessionKey)) {
						_sessions.get(sessionKey).disconnect(true);
					}
				}
			});
			
			return true;
		} else if (action.equals("setVideoView")) {
			_videoConfig = VideoConfig.fromJSON(args.getJSONObject(0));
			 
			cordova.getActivity().runOnUiThread(new Runnable() {
				@SuppressWarnings("deprecation")
				public void run() {
					if (!_initializedAndroidGlobals) {
						abortUnless(PeerConnectionFactory.initializeAndroidGlobals(cordova.getActivity(), true, true, 
								VideoRendererGuiEx.getEGLContext()),
								"Failed to initializeAndroidGlobals");
						_initializedAndroidGlobals = true;
					}
					
					if (_peerConnectionFactory == null) {
						_peerConnectionFactory = new PeerConnectionFactory();
					}

					_videoParams = new WebView.LayoutParams(
							_videoConfig.getContainer().getWidth() * _videoConfig.getDevicePixelRatio(), 
							_videoConfig.getContainer().getHeight() * _videoConfig.getDevicePixelRatio(), 
							_videoConfig.getContainer().getX() * _videoConfig.getDevicePixelRatio(), 
							_videoConfig.getContainer().getY() * _videoConfig.getDevicePixelRatio());
				
					if (_videoView == null) {
						initializeLocalVideoTrack();
					} else {
						refreshVideoView(); 
					}
				}
			});
			
			return true;
		} else if (action.equals("hideVideoView")) {
			cordova.getActivity().runOnUiThread(new Runnable() {
				public void run() {
					_videoView.setVisibility(View.GONE);
				}
			});
		} else if (action.equals("showVideoView")) {
			cordova.getActivity().runOnUiThread(new Runnable() {
				public void run() {
					_videoView.setVisibility(View.VISIBLE);
				}
			});		
		} else if (action.equals("removeLocalVideoView")) {
			removeVideoView();
		}

		callbackContext.error("Invalid action: " + action);
		return false;
	}

	void initializeLocalVideoTrack() {
		_videoCapturer = getVideoCapturer();
		_videoSource = _peerConnectionFactory.createVideoSource(_videoCapturer, 
				new MediaConstraints());
		_localVideo = new VideoTrackRendererPair(_peerConnectionFactory.createVideoTrack("ARDAMSv0", _videoSource), null);
		refreshVideoView(); 
	}
	
	int getPercentage(int localValue, int containerValue) {
		return (int)(localValue * 100.0 / containerValue);
	}
	
	void initializeLocalAudioTrack() {
		_audioSource = _peerConnectionFactory.createAudioSource(new MediaConstraints());
		_audioTrack = _peerConnectionFactory.createAudioTrack("ARDAMSa0", _audioSource);
	}
	
	public VideoTrack getLocalVideoTrack() {
		if (_localVideo == null) {
			return null;
		}
		
		return _localVideo.getVideoTrack();
	}
	
	public AudioTrack getLocalAudioTrack() {
		return _audioTrack;
	}
	
	public PeerConnectionFactory getPeerConnectionFactory() {
		return _peerConnectionFactory;
	}
	
	public Activity getActivity() {
		return cordova.getActivity();
	}
	
	public WebView getWebView() {
		return this.getWebView();
	}
	
	public VideoConfig getVideoConfig() {
		return this._videoConfig;
	}
	
	private static void abortUnless(boolean condition, String msg) {
		if (!condition) {
			throw new RuntimeException(msg);
		}
	}

	// Cycle through likely device names for the camera and return the first
	// capturer that works, or crash if none do.
	private VideoCapturer getVideoCapturer() {
		String[] cameraFacing = { "front", "back" };
		int[] cameraIndex = { 0, 1 };
		int[] cameraOrientation = { 0, 90, 180, 270 };
		for (String facing : cameraFacing) {
			for (int index : cameraIndex) {
				for (int orientation : cameraOrientation) {
					String name = "Camera " + index + ", Facing " + facing +
						", Orientation " + orientation;
					VideoCapturer capturer = VideoCapturer.create(name);
					if (capturer != null) {
						// logAndToast("Using camera: " + name);
						return capturer;
					}
				}
			}
		}
		throw new RuntimeException("Failed to open capturer");
	}
	
	public void addRemoteVideoTrack(VideoTrack videoTrack) {
		_remoteVideos.add(new VideoTrackRendererPair(videoTrack, null));
		refreshVideoView();
	}

	public void removeRemoteVideoTrack(VideoTrack videoTrack) {
		for (VideoTrackRendererPair pair : _remoteVideos) { 
			if (pair.getVideoTrack() == videoTrack) {
				if (pair.getVideoRenderer() != null) {
					pair.getVideoTrack().removeRenderer(pair.getVideoRenderer());
					pair.setVideoRenderer(null);
				}
				
				pair.setVideoTrack(null);
				
				_remoteVideos.remove(pair);
				refreshVideoView();
				return;
			}
		}
	}
	
	private void createVideoView() {
		Point size = new Point();
		size.set(_videoConfig.getContainer().getWidth() * _videoConfig.getDevicePixelRatio(), 
				_videoConfig.getContainer().getHeight() * _videoConfig.getDevicePixelRatio());
		_videoView = new VideoGLView(cordova.getActivity(), size);
		_videoView.setEGLConfigChooser(8, 8, 8, 8, 16, 0);
		_videoView.getHolder().setFormat(PixelFormat.TRANSLUCENT);

		VideoRendererGuiEx.setView(_videoView, new Runnable() {
			@Override
			public void run() {
				GLES20.glClearColor(0.0f, 0.0f, 0.0f, 0.0f);
			}
			
		});
	
		webView.addView(_videoView, _videoParams);
	}
	
	private void refreshVideoView() {
		int n = _remoteVideos.size();
		
		for (VideoTrackRendererPair pair : _remoteVideos) {
			if (pair.getVideoRenderer() != null) {
				pair.getVideoTrack().removeRenderer(pair.getVideoRenderer());
			}
			
			pair.setVideoRenderer(null);
		}
		
		if (_localVideo != null && _localVideo.getVideoRenderer() != null) {
			_localVideo.getVideoTrack().removeRenderer(_localVideo.getVideoRenderer());
			_localVideo.setVideoRenderer(null);
		}
		
		if (_videoView != null) {
            webView.removeView(_videoView);
            _videoView = null;
        }
		createVideoView(); 
		
		if (n > 0) {	
			int rows = n < 9 ? 2 : 3;
			int videosInRow = n == 2 ? 2 : (int)Math.ceil((float)n / rows);
			
			int videoSize = (int)((float)_videoConfig.getRemoteRegion().getWidth() / videosInRow);
			int actualRows = (int)Math.ceil((float)n / videosInRow);
			
			int y = getCenter(actualRows, videoSize, _videoConfig.getRemoteRegion().getHeight());
			
			int videoIndex = 0;
			int videoSizeAsPercentage = getPercentage(videoSize, _videoConfig.getContainer().getWidth());
			
			for (int row = 0; row < rows && videoIndex < n; row++) {
				int x = getCenter(row < row - 1 || n % rows == 0 ? 
									videosInRow : n - (Math.min(n, videoIndex + videosInRow) - 1),
								videoSize,
								_videoConfig.getRemoteRegion().getWidth());
				
				for (int video = 0; video < videosInRow && videoIndex < n; video++) {
					VideoTrackRendererPair pair = _remoteVideos.get(videoIndex++);

					Log.v("fang", "test video"+x+","+y+","+videoSizeAsPercentage+","+videoSizeAsPercentage);
					pair.setVideoRenderer(new VideoRenderer(
							VideoRendererGuiEx.create(x, y, videoSizeAsPercentage, videoSizeAsPercentage, 
									VideoRendererGuiEx.ScalingType.SCALE_FILL, true)));
				
					pair.getVideoTrack().addRenderer(pair.getVideoRenderer());
					
					x += videoSizeAsPercentage;
				}
				
				y += getPercentage(videoSize, _videoConfig.getContainer().getHeight());
			}
		}

		int arg0 = getPercentage(_videoConfig.getLocalRegion().getX(), _videoConfig.getContainer().getWidth());
		int arg1 = getPercentage(_videoConfig.getLocalRegion().getY(), _videoConfig.getContainer().getHeight()); 
		int arg2 = getPercentage(_videoConfig.getLocalRegion().getWidth(), _videoConfig.getContainer().getWidth()); 
		int arg3 = getPercentage(_videoConfig.getLocalRegion().getHeight(), _videoConfig.getContainer().getHeight());
		
		if (arg0+arg2 > 100) {
			arg2 = 100-arg0;
		}
		if (arg1+arg3 > 100) {
			arg3 = 100-arg1;
		}
		
		_localVideo.getVideoTrack().addRenderer(new VideoRenderer(
				VideoRendererGuiEx.create(arg0, arg1, arg2, arg3, 
						VideoRendererGuiEx.ScalingType.SCALE_FILL,
						true)
				)
		);
	}
	
	int getCenter(int videoCount, int videoSize, int containerSize) {
		return getPercentage((int)Math.round((containerSize - videoSize * videoCount) / 2.0), containerSize);
	}
	
	PluginResult getSessionKeyPluginResult(String sessionKey) throws JSONException {
		JSONObject json = new JSONObject();
		json.put("type", "__set_session_key");
		json.put("sessionKey", sessionKey);
		
		PluginResult result = new PluginResult(PluginResult.Status.OK, json);
		result.setKeepCallback(true);
		
		return result;
	}
	
	public void onSessionDisconnect(String sessionKey) {
		_sessions.remove(sessionKey);
		if (_sessions.size() == 0) {
			removeVideoView();
		}
	} 
	
	public void removeVideoView() {
		cordova.getActivity().runOnUiThread(new Runnable() {
			public void run() {
				if (_localVideo != null ) {
					if (_localVideo.getVideoTrack() != null && _localVideo.getVideoRenderer() != null) {
						_localVideo.getVideoTrack().removeRenderer(_localVideo.getVideoRenderer());
					}
					
					_localVideo = null;	
				}
		
				if (_videoView != null) {
					VideoGLView videoView = _videoView;
					_videoView = null;
					videoView.setVisibility(View.GONE);
					webView.removeView(videoView);
				}

				if (_videoSource != null) {
//					if (_shouldDispose) {
//						_videoSource.dispose();
//					} else {
						_videoSource.stop();
//					}
					_videoSource = null;
				}
				
				if (_videoCapturer != null) {
					_videoCapturer.dispose();
					_videoCapturer = null;
				}
                
                if (_audioSource != null) {
//                    _audioSource.dispose();
                    _audioSource = null;
                    _audioTrack = null;
                }
                
				// if (_peerConnectionFactory != null) {
				// 	_peerConnectionFactory.dispose();
				// 	_peerConnectionFactory = null;
				// }
				
				_remoteVideos.clear();
				_shouldDispose = true;
			}
		});
	}
	
	public boolean shouldDispose() {
		return _shouldDispose;
	}
}
