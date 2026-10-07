package com.auravolmax.soundbooster;

import android.media.audiofx.LoudnessEnhancer;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "GlobalAudioBooster")
public class GlobalAudioBoosterPlugin extends Plugin {

    private LoudnessEnhancer loudnessEnhancer = null;

    @PluginMethod
    public void setSystemBoost(PluginCall call) {
        Integer boostPercent = call.getInt("boost", 100);

        try {
            // AudioSession 0 binds to the entire global mix on Android
            if (loudnessEnhancer == null) {
                loudnessEnhancer = new LoudnessEnhancer(0);
            }

            if (boostPercent <= 100) {
                loudnessEnhancer.setEnabled(false);
            } else {
                loudnessEnhancer.setEnabled(true);
                // 100% -> 0 mB (millibels)
                // 200% -> +1500 mB (+15 dB)
                // 300% -> +3000 mB (+30 dB)
                int gainMillibels = (int) (((boostPercent - 100) / 200.0) * 3000);
                loudnessEnhancer.setTargetGain(gainMillibels);
            }

            call.resolve();
        } catch (Exception e) {
            call.reject("Erro ao aplicar ganho de hardware: " + e.getMessage());
        }
    }

    @Override
    protected void handleOnDestroy() {
        if (loudnessEnhancer != null) {
            loudnessEnhancer.release();
            loudnessEnhancer = null;
        }
        super.handleOnDestroy();
    }
}
