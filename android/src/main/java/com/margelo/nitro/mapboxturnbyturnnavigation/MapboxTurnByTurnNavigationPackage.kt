package com.margelo.nitro.mapboxturnbyturnnavigation

import com.facebook.react.TurboReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfoProvider
import com.facebook.react.uimanager.ViewManager
import com.margelo.nitro.mapboxturnbyturnnavigation.views.HybridMapboxTurnByTurnNavigationManager



class MapboxTurnByTurnNavigationPackage : TurboReactPackage() {
    override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? {
        return null
    }

    override fun getReactModuleInfoProvider(): ReactModuleInfoProvider {
        return ReactModuleInfoProvider { HashMap() }
    }

    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
        return listOf(HybridMapboxTurnByTurnNavigationManager())
    }

    companion object {
        init {
            System.loadLibrary("mapboxturnbyturnnavigation")
        }
    }
}
