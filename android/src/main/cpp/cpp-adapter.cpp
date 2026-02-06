#include <jni.h>
#include "nitromapboxnavigationOnLoad.hpp"

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM* vm, void*) {
  return margelo::nitro::nitromapboxnavigation::initialize(vm);
}
