package com.auravolmax.soundbooster;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(GlobalAudioBoosterPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
