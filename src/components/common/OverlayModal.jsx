import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableWithoutFeedback,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

const OverlayModal = (props) => {
  const { open, onClose, onSubmit, children, heading, loading } = props;

  return (
    <Modal
      transparent={true}
      visible={open}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              {/* Heading */}
              {heading && (
                <View className="rounded-t-lg p-4 bg-primary">
                  <Text className="text-white text-base tracking-wider">
                    {heading}
                  </Text>
                </View>
              )}

              <View className="p-3">{children}</View>

              {/* Footer */}
              <View className="py-3 flex flex-row justify-around">
                <TouchableOpacity onPress={onClose} activeOpacity={0.6}>
                  <Text className="text-primary tracking-wider text-base">
                    Close
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  disabled={loading}
                  onPress={onSubmit}
                  activeOpacity={0.6}
                >
                  <Text className="text-primary tracking-wider text-base">
                    {loading ? "Loading..." : "OK"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: 350,
    backgroundColor: "white",
    borderRadius: 8,
  },
});

export default OverlayModal;
