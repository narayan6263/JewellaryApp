import * as ImagePicker from "expo-image-picker";
import React, { memo, useEffect, useState } from "react";
import Entypo from "@expo/vector-icons/Entypo";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {
  View,
  Image,
  TouchableOpacity,
  Platform,
  Alert,
  StyleSheet,
} from "react-native";

const ImagePickerComponent = ({ onChange, name, value }) => {
  const [preview, setPreview] = useState();

  useEffect(() => {
    (async () => {
      if (Platform.OS !== "web") {
        const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          const { status: newStatus } =
            await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (newStatus !== "granted") {
            Alert.alert(
              "Permission Required",
              "Sorry, we need camera roll permissions to make this work!",
              [{ text: "OK" }]
            );
          }
        }
      }
    })();
  }, []);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        const selectedImage = result.assets[0];
        // Ensure we're passing a string URI
        const imageUri = selectedImage.uri.toString();
        setPreview(imageUri);
        
        // Format the image data properly
        const imageData = {
          uri: imageUri,
          type: 'image/jpeg',
          name: `image_${Date.now()}.jpg`
        };
        
        onChange({ name, value: imageData });
      }
    } catch (error) {
      console.error("Error picking an image:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  // Get the correct URI for display
  const displayUri = typeof value === 'string' ? value : 
                    value?.uri ? value.uri.toString() : 
                    preview;

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.7}
      onPress={pickImage}
    >
      {displayUri ? (
        <Image
          source={{ uri: displayUri }}
          style={styles.image}
          resizeMode="cover"
        />
      ) : (
        <MaterialIcons name="photo-library" color="lightgray" size={47} />
      )}
      <Entypo name="circle-with-plus" style={styles.plusIcon} size={22} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 64,
    height: 64,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1d1d1",
    padding: 6,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  image: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  plusIcon: {
    position: "absolute",
    bottom: 2,
    right: 4,
    backgroundColor: "white",
    borderRadius: 50,
    color: "#5750F1", // User's theme color
  },
});

export default memo(ImagePickerComponent);
