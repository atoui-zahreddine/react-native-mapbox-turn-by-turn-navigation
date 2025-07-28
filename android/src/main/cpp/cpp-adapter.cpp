#include <jni.h>
#include "mapboxturnbyturnnavigationOnLoad.hpp"

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM* vm, void*) {
  return margelo::nitro::mapboxturnbyturnnavigation::initialize(vm);
}
