import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import { Platform, Alert } from 'react-native';
import { v4 as uuidv4 } from 'uuid';
import { checkPermissions, requestMediaLibraryPermissions } from './permissions';

const VIDEO_FOLDER_NAME = 'SocialSaver_Videos';
const AUDIO_FOLDER_NAME = 'SocialSaver_Audio';
const IMAGE_FOLDER_NAME = 'SocialSaver_Images';

export type SaveLocation = 'media_library' | 'downloads' | 'movies' | 'music';

export interface SaveOptions {
  location: SaveLocation;
  createAlbum?: boolean;
}

export const setupFolders = async (): Promise<void> => {
  if (Platform.OS === 'web') return;

  try {
    const baseDir = FileSystem.documentDirectory;
    if (!baseDir) return;
    const socialSaverDir = `${baseDir}SocialSaver`;
    await Promise.all([
      FileSystem.makeDirectoryAsync(`${socialSaverDir}/Videos`, { intermediates: true }),
      FileSystem.makeDirectoryAsync(`${socialSaverDir}/Audio`, { intermediates: true }),
      FileSystem.makeDirectoryAsync(`${socialSaverDir}/Images`, { intermediates: true }),
    ]);
  } catch (error) {
    console.error('Error setting up folders:', error);
  }
};

const createAlbumIfNotExists = async (
  albumName: string,
  existingAsset: MediaLibrary.Asset
): Promise<MediaLibrary.Album | null> => {
  try {
    let album = await MediaLibrary.getAlbumAsync(albumName);
    if (!album) {
      album = await MediaLibrary.createAlbumAsync(albumName, existingAsset, false);
    }
    return album;
  } catch (error) {
    console.error(`Error creating album ${albumName}:`, error);
    return null;
  }
};

export const saveFile = async (
  fileUri: string,
  fileName: string,
  type: 'video' | 'audio' | 'image',
  options: SaveOptions = { location: 'downloads', createAlbum: true }
): Promise<string | null> => {
  if (Platform.OS === 'web') return fileUri;

  try {
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (!fileInfo.exists) {
      throw new Error('Source file does not exist');
    }

    if (!fileName) fileName = `${type}_${uuidv4()}`;
    if (!fileName.includes('.')) {
      if (type === 'video') fileName += '.mp4';
      else if (type === 'audio') fileName += '.mp3';
      else if (type === 'image') fileName += '.jpg';
    }

    let savedPath: string | null = null;

    switch (options.location) {
      case 'media_library':
        savedPath = await saveToMediaLibrary(fileUri, fileName, type, options.createAlbum);
        break;
      case 'downloads':
        savedPath = await saveToDownloads(fileUri, fileName, type);
        break;
      case 'movies':
        savedPath = await saveToMovies(fileUri, fileName, type);
        break;
      case 'music':
        savedPath = await saveToMusic(fileUri, fileName, type);
        break;
      default:
        savedPath = await saveToDownloads(fileUri, fileName, type);
    }

    return savedPath;
  } catch (error) {
    console.error('Error saving file:', error);
    Alert.alert('Save Failed', `Failed to save ${type}. Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return null;
  }
};

const saveToMediaLibrary = async (
  fileUri: string,
  fileName: string,
  type: 'video' | 'audio' | 'image',
  createAlbum: boolean = true
): Promise<string | null> => {
  try {
    const hasPermission = await requestMediaLibraryPermissions();
    if (!hasPermission) {
      return null;
    }

    if (Platform.OS === 'android') {
      await MediaLibrary.saveToLibraryAsync(fileUri);
      return fileUri;
    } else {
      const asset = await MediaLibrary.createAssetAsync(fileUri);
      let albumName = VIDEO_FOLDER_NAME;
      if (type === 'audio') albumName = AUDIO_FOLDER_NAME;
      if (type === 'image') albumName = IMAGE_FOLDER_NAME;

      let targetAlbum = await MediaLibrary.getAlbumAsync(albumName);
      if (!targetAlbum) {
        targetAlbum = await createAlbumIfNotExists(albumName, asset);
      } else {
        await MediaLibrary.addAssetsToAlbumAsync([asset], targetAlbum, false);
      }
      return asset.uri;
    }
  } catch (error) {
    console.error('Error saving to media library:', error);
    throw error;
  }
};

const saveToDownloads = async (
  fileUri: string,
  fileName: string,
  type: 'video' | 'audio' | 'image'
): Promise<string | null> => {
  try {
    const baseDir = FileSystem.documentDirectory;
    const socialSaverDir = `${baseDir}SocialSaver`;
    const typeDir = `${socialSaverDir}/${type === 'video' ? 'Videos' : type === 'audio' ? 'Audio' : 'Images'}`;
    await FileSystem.makeDirectoryAsync(typeDir, { intermediates: true });
    const targetPath = `${typeDir}/${fileName}`;
    await FileSystem.copyAsync({ from: fileUri, to: targetPath });
    return targetPath;
  } catch (error) {
    console.error('Error saving to downloads:', error);
    throw error;
  }
};

const saveToMovies = async (
  fileUri: string,
  fileName: string,
  type: 'video' | 'audio' | 'image'
): Promise<string | null> => {
  try {
    const baseDir = FileSystem.documentDirectory;
    const moviesDir = `${baseDir}Movies/SocialSaver`;
    await FileSystem.makeDirectoryAsync(moviesDir, { intermediates: true });
    const targetPath = `${moviesDir}/${fileName}`;
    await FileSystem.copyAsync({ from: fileUri, to: targetPath });
    return targetPath;
  } catch (error) {
    console.error('Error saving to movies:', error);
    throw error;
  }
};

const saveToMusic = async (
  fileUri: string,
  fileName: string,
  type: 'video' | 'audio' | 'image'
): Promise<string | null> => {
  try {
    const baseDir = FileSystem.documentDirectory;
    const musicDir = `${baseDir}Music/SocialSaver`;
    await FileSystem.makeDirectoryAsync(musicDir, { intermediates: true });
    const targetPath = `${musicDir}/${fileName}`;
    await FileSystem.copyAsync({ from: fileUri, to: targetPath });
    return targetPath;
  } catch (error) {
    console.error('Error saving to music:', error);
    throw error;
  }
};

export const checkAlbumContents = async (): Promise<void> => {
  try {
    const hasPermission = await checkPermissions();
    if (!hasPermission) {
      Alert.alert('Permission Required', 'Media library permission is needed to check album contents.');
      return;
    }

    const albums = await MediaLibrary.getAlbumsAsync();
    const socialSaverAlbums = albums.filter(album => album.title && album.title.startsWith('SocialSaver'));
    let totalFiles = 0;

    for (const album of socialSaverAlbums) {
      const assets = await MediaLibrary.getAssetsAsync({ album, first: 1000 });
      totalFiles += assets.totalCount;
    }

    if (totalFiles === 0) {
      Alert.alert('Empty Albums', 'SocialSaver albums exist but contain no files.');
    } else {
      Alert.alert('Album Contents', `Found ${socialSaverAlbums.length} SocialSaver albums with ${totalFiles} total files. Check your Photos/Gallery app.`);
    }
  } catch (error) {
    console.error('Error checking album contents:', error);
    Alert.alert('Error', 'Failed to check album contents.');
  }
};

export const listSavedFiles = async (): Promise<void> => {
  try {
    const baseDir = FileSystem.documentDirectory;
    const socialSaverDir = `${baseDir}SocialSaver`;
    const dirInfo = await FileSystem.getInfoAsync(socialSaverDir);
    if (!dirInfo.exists) {
      console.log('No SocialSaver directory found');
      return;
    }

    const contents = await FileSystem.readDirectoryAsync(socialSaverDir);
    console.log('SocialSaver directory contents:', contents);
  } catch (error) {
    console.error('Error listing saved files:', error);
  }
};
