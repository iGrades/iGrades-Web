package com.igrades.app;

import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.view.Window;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        applyFullscreenAndNavigationBar();
    }

    @Override
    public void onResume() {
        super.onResume();
        applyFullscreenAndNavigationBar();
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) {
            applyFullscreenAndNavigationBar();
        }
    }

    /**
     * Applies full screen mode (hiding the status bar) while ensuring
     * the phone bottom navigation bar is shown and styled appropriately.
     */
    private void applyFullscreenAndNavigationBar() {
        Window window = getWindow();
        if (window == null) return;

        WindowInsetsControllerCompat controller =
            WindowCompat.getInsetsController(window, window.getDecorView());

        if (controller != null) {
            // Hide phone status bar for full screen
            controller.hide(WindowInsetsCompat.Type.statusBars());
            // Show navigation bar
            controller.show(WindowInsetsCompat.Type.navigationBars());
            controller.setSystemBarsBehavior(
                WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
            );
            // Default light appearance for navigation bar buttons
            controller.setAppearanceLightNavigationBars(true);
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            window.setNavigationBarColor(Color.WHITE);
        }
    }
}
