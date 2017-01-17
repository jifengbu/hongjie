package plugins.folder;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

import com.hongjie.mrp.MainActivity;
import com.hongjie.mrp.R;

import android.app.ListActivity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.view.View.OnClickListener;
import android.view.Window;
import android.widget.Button;
import android.widget.ListView;
import android.widget.TextView;

public class MyFileManager extends ListActivity {
	private List<String> items = null;
	private List<String> paths = null;
	private String rootPath = "/";
	private String curPath = "/";
	private TextView mPath;
	private int showType = 1; // 0 folder 1 file

	private final static String TAG = "bb";

	@Override
	protected void onCreate(Bundle icicle) {
		super.onCreate(icicle);

		requestWindowFeature(Window.FEATURE_NO_TITLE);

		setContentView(R.layout.fileselect);
		mPath = (TextView) findViewById(R.id.mPath);
		Button buttonConfirm = (Button) findViewById(R.id.buttonConfirm);
		buttonConfirm.setOnClickListener(new OnClickListener() {
			public void onClick(View v) {
				Intent data = new Intent(MyFileManager.this, MainActivity.class);
				Bundle bundle = new Bundle();
				bundle.putString("file", curPath);
				data.putExtras(bundle);
				setResult(2, data);
				finish();

			}
		});
		Button buttonCancle = (Button) findViewById(R.id.buttonCancle);
		buttonCancle.setOnClickListener(new OnClickListener() {
			public void onClick(View v) {
				finish();
			}
		});
		
		Intent intent = getIntent();  
		String startdir = intent.getStringExtra("startdir");
		showType = intent.getIntExtra("type", 0);
		File f = new File(startdir);
		if (f.exists()) {
			curPath = startdir;
		} else {
			curPath = rootPath;
		}
		getFileDir(curPath);
	}

	private void getFileDir(String filePath) {
		mPath.setText(filePath);
		items = new ArrayList<String>();
		paths = new ArrayList<String>();
		File f = new File(filePath);
		File[] files = f.listFiles();

		if (filePath.equals(rootPath)) {
			for (int i = 0; i < files.length; i++) {
				File file = files[i];
				String filename = file.getName();
				if ((filename.contains("sdcard") || filename
						.contains("storage")) && (file.isDirectory())) {
					items.add(file.getName());
					paths.add(file.getPath());
				}
			}
		} else {
			items.add("b1");
			paths.add(rootPath);
			items.add("b2");
			paths.add(f.getParent());
			for (int i = 0; i < files.length; i++) {
				File file = files[i];
				if (showType == 0 && file.isFile()) {
					continue;
				}
				items.add(file.getName());
				paths.add(file.getPath());
			}
		}

		setListAdapter(new MyAdapter(this, items, paths));
	}

	@Override
	protected void onListItemClick(ListView l, View v, int position, long id) {
		File file = new File(paths.get(position));
		if (file.isDirectory()) {
			curPath = paths.get(position);
			getFileDir(paths.get(position));
		} else {
			curPath = file.getAbsolutePath();
			mPath.setText(curPath);
		}
	}
}