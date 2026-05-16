// imageUtils — CampusCare image compression helper.
// compressImage(uri): resizes to max 1024px width at 70% JPEG quality.
// Reduces upload size while keeping acceptable visual quality.
// Returns original URI as fallback if manipulation fails.import * as ImageManipulator from 'expo-image-manipulator';

export const compressImage = async (uri) => {
  try {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1024 } }],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );
    return result;
  } catch {
    return { uri };
  }
};
