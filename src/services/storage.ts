// import * as FileSystem from 'expo-file-system';
// import * as MediaLibrary from 'expo-media-library';
// import { Platform, Alert } from 'react-native';
// import { v4 as uuidv4 } from 'uuid';
// import { checkPermissions, requestMediaLibraryPermissions } from './permissions';

// const APP_FOLDER_NAME = 'SocialSaver';
// const VIDEO_FOLDER_NAME = 'SocialSaver_Videos';
// const AUDIO_FOLDER_NAME = 'SocialSaver_Audio';
// const IMAGE_FOLDER_NAME = 'SocialSaver_Images';

// // Define save locations
// export type SaveLocation = 'media_library' | 'downloads' | 'movies' | 'music';

// export interface SaveOptions {
//   location: SaveLocation;
//   createAlbum?: boolean; // Only for media_library
// }

// export const checkAlbumContents = async (): Promise<void> => {
//   try {
//     const hasPermission = await checkPermissions();
//     if (!hasPermission) {
//       Alert.alert('Permission Required', 'Media library permission is needed to check album contents.');
//       return;
//     }

//     // Check all albums
//     const albums = await MediaLibrary.getAlbumsAsync();
//     const socialSaverAlbums = albums.filter(album => 
//       album.title.startsWith('SocialSaver')
//     );

//     if (socialSaverAlbums.length === 0) {
//       Alert.alert('Albums Not Found', 'No SocialSaver albums exist yet. Download content first.');
//       return;
//     }

//     let totalFiles = 0;
//     for (const album of socialSaverAlbums) {
//       const assets = await MediaLibrary.getAssetsAsync({
//         album: album,
//         first: 1000, // Just get count
//       });
//       totalFiles += assets.totalCount;
//     }

//     if (totalFiles === 0) {
//       Alert.alert('Empty Albums', 'SocialSaver albums exist but contain no files.');
//     } else {
//       Alert.alert(
//         'Album Contents', 
//         `Found ${socialSaverAlbums.length} SocialSaver albums with ${totalFiles} total files. Check your Photos/Gallery app.`
//       );
//     }
//   } catch (error) {
//     console.error('Error checking album contents:', error);
//     Alert.alert('Error', 'Failed to check album contents.');
//   }
// };

// export const setupFolders = async (): Promise<void> => {
//   if (Platform.OS === 'web') return;

//   try {
//     console.log('=== SETTING UP FOLDERS ===');
//     const hasPermission = await checkPermissions();
//     if (!hasPermission) {
//       console.log('No permission for folder setup');
//       return;
//     }

//     // Create all necessary albums for media library
//     await Promise.all([
//       createAlbumIfNotExists(APP_FOLDER_NAME),
//       createAlbumIfNotExists(VIDEO_FOLDER_NAME),
//       createAlbumIfNotExists(AUDIO_FOLDER_NAME),
//       createAlbumIfNotExists(IMAGE_FOLDER_NAME)
//     ]);

//     // Create directories in Downloads/Movies/Music folders
//     await createDirectoryStructure();

//     console.log('=== FOLDERS SETUP COMPLETE ===');
//   } catch (error) {
//     console.error('Error setting up folders:', error);
//   }
// };

// const createDirectoryStructure = async (): Promise<void> => {
//   try {
//     console.log('=== CREATING DIRECTORY STRUCTURE ===');
    
//     // Get external storage directories
//     const directories = await getStorageDirectories();
    
//     // Create SocialSaver folders in each directory
//     for (const [dirType, dirPath] of Object.entries(directories)) {
//       if (dirPath) {
//         const socialSaverPath = `${dirPath}/SocialSaver`;
        
//         console.log(`Creating directory: ${socialSaverPath}`);
        
//         try {
//           await FileSystem.makeDirectoryAsync(socialSaverPath, { intermediates: true });
//           console.log(`✅ Created directory: ${socialSaverPath}`);
          
//           // Create subdirectories
//           const subDirs = ['Videos', 'Audio', 'Images'];
//           for (const subDir of subDirs) {
//             const subPath = `${socialSaverPath}/${subDir}`;
//             await FileSystem.makeDirectoryAsync(subPath, { intermediates: true });
//             console.log(`✅ Created subdirectory: ${subPath}`);
//           }
//         } catch (dirError) {
//           console.log(`⚠️ Could not create directory ${socialSaverPath}:`, dirError);
//         }
//       }
//     }
//   } catch (error) {
//     console.error('Error creating directory structure:', error);
//   }
// };

// const getStorageDirectories = async (): Promise<Record<string, string | null>> => {
//   const directories: Record<string, string | null> = {};
  
//   try {
//     // Get document directory (always available)
//     directories.documents = FileSystem.documentDirectory;
    
//     // Try to get external storage directories (Android)
//     if (Platform.OS === 'android') {
//       try {
//         // These might not be available on all devices
//         const storageDirectory = FileSystem.StorageAccessFramework.getUriForDirectoryInRoot('Download');
//         directories.downloads = storageDirectory;
//       } catch (error) {
//         console.log('Downloads directory not accessible via SAF');
//       }
//     }
    
//     console.log('Available directories:', directories);
//     return directories;
//   } catch (error) {
//     console.error('Error getting storage directories:', error);
//     return { documents: FileSystem.documentDirectory };
//   }
// };

// const createAlbumIfNotExists = async (albumName: string): Promise<MediaLibrary.Album | null> => {
//   try {
//     console.log(`Checking/creating album: ${albumName}`);
    
//     // Check if album already exists
//     let album = await MediaLibrary.getAlbumAsync(albumName);
//     if (album) {
//       console.log(`Album ${albumName} already exists`);
//       return album;
//     }

//     // Create temporary file to create album
//     const tempFilePath = `${FileSystem.cacheDirectory}temp_${albumName}_${Date.now()}.jpg`;
//     await FileSystem.writeAsStringAsync(
//       tempFilePath,
//       'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
//       { encoding: FileSystem.EncodingType.Base64 }
//     );

//     // Create asset and album
//     const asset = await MediaLibrary.createAssetAsync(tempFilePath);
//     album = await MediaLibrary.createAlbumAsync(albumName, asset, false);
    
//     // Clean up temp file
//     await FileSystem.deleteAsync(tempFilePath, { idempotent: true });
    
//     console.log(`Successfully created album: ${albumName}`);
//     return album;
//   } catch (error) {
//     console.error(`Error creating album ${albumName}:`, error);
//     return null;
//   }
// };

// // Enhanced save function with location options
// export const saveFile = async (
//   fileUri: string,
//   fileName: string,
//   type: 'video' | 'audio' | 'image',
//   options: SaveOptions = { location: 'downloads', createAlbum: true }
// ): Promise<string | null> => {
//   if (Platform.OS === 'web') return fileUri;

//   try {
//     console.log('=== SAVING FILE ===');
//     console.log('File URI:', fileUri);
//     console.log('File Name:', fileName);
//     console.log('File Type:', type);
//     console.log('Save Options:', options);

//     // Check if source file exists
//     const fileInfo = await FileSystem.getInfoAsync(fileUri);
//     if (!fileInfo.exists) {
//       console.error('❌ Source file does not exist:', fileUri);
//       throw new Error('Source file does not exist');
//     }

//     console.log('✅ Source file exists, size:', fileInfo.size);

//     // Ensure filename has proper extension
//     if (!fileName) fileName = `${type}_${uuidv4()}`;
//     if (!fileName.includes('.')) {
//       if (type === 'video') fileName += '.mp4';
//       else if (type === 'audio') fileName += '.mp3';
//       else if (type === 'image') fileName += '.jpg';
//     }

//     console.log('Final filename:', fileName);

//     let savedPath: string | null = null;

//     // Save based on location preference
//     switch (options.location) {
//       case 'media_library':
//         savedPath = await saveToMediaLibrary(fileUri, fileName, type, options.createAlbum);
//         break;
//       case 'downloads':
//         savedPath = await saveToDownloads(fileUri, fileName, type);
//         break;
//       case 'movies':
//         savedPath = await saveToMovies(fileUri, fileName, type);
//         break;
//       case 'music':
//         savedPath = await saveToMusic(fileUri, fileName, type);
//         break;
//       default:
//         // Default to downloads
//         savedPath = await saveToDownloads(fileUri, fileName, type);
//     }

//     if (savedPath) {
//       console.log('✅ File saved successfully to:', savedPath);
      
//       Alert.alert(
//         'File Saved Successfully',
//         `Your ${type} has been saved to ${options.location}. Path: ${savedPath}`,
//         [{ text: 'OK' }]
//       );
      
//       return savedPath;
//     } else {
//       throw new Error('Failed to save file to specified location');
//     }

//   } catch (error) {
//     console.error('=== ERROR SAVING FILE ===');
//     console.error('Error details:', error);
//     Alert.alert(
//       'Save Failed',
//       `Failed to save ${type}. Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
//       [{ text: 'OK' }]
//     );
//     return null;
//   }
// };

// const saveToMediaLibrary = async (
//   fileUri: string,
//   fileName: string,
//   type: 'video' | 'audio' | 'image',
//   createAlbum: boolean = true
// ): Promise<string | null> => {
//   try {
//     console.log('📱 Saving to Media Library...');
    
//     const hasPermission = await requestMediaLibraryPermissions();
//     if (!hasPermission) {
//       console.log('❌ No permission to save to media library');
//       return null;
//     }

//     // Create asset directly from the downloaded file
//     console.log('Creating media asset...');
//     const asset = await MediaLibrary.createAssetAsync(fileUri);
//     console.log('✅ Asset created:', asset.id);
//     console.log('Asset URI:', asset.uri);

//     if (createAlbum) {
//       // Determine the correct album name based on type
//       let albumName = VIDEO_FOLDER_NAME;
//       if (type === 'audio') albumName = AUDIO_FOLDER_NAME;
//       if (type === 'image') albumName = IMAGE_FOLDER_NAME;

//       console.log('Target album:', albumName);

//       // Get or create the target album
//       let targetAlbum = await MediaLibrary.getAlbumAsync(albumName);
//       if (!targetAlbum) {
//         console.log(`Album ${albumName} doesn't exist, creating...`);
//         targetAlbum = await createAlbumIfNotExists(albumName);
//         if (!targetAlbum) {
//           throw new Error(`Failed to create album ${albumName}`);
//         }
//       }

//       // Add asset to the album
//       const addResult = await MediaLibrary.addAssetsToAlbumAsync([asset], targetAlbum, false);
//       console.log('✅ Asset added to album, result:', addResult);

//       // Also add to main SocialSaver album
//       let mainAlbum = await MediaLibrary.getAlbumAsync(APP_FOLDER_NAME);
//       if (!mainAlbum) {
//         mainAlbum = await createAlbumIfNotExists(APP_FOLDER_NAME);
//       }
//       if (mainAlbum) {
//         await MediaLibrary.addAssetsToAlbumAsync([asset], mainAlbum, false);
//         console.log('✅ Asset also added to main album');
//       }
//     }

//     return asset.uri;
//   } catch (error) {
//     console.error('❌ Error saving to media library:', error);
//     throw error;
//   }
// };

// const saveToDownloads = async (
//   fileUri: string,
//   fileName: string,
//   type: 'video' | 'audio' | 'image'
// ): Promise<string | null> => {
//   try {
//     console.log('💾 Saving to Downloads folder...');
    
//     // Use document directory as base (most reliable)
//     const baseDir = FileSystem.documentDirectory;
//     const socialSaverDir = `${baseDir}SocialSaver`;
//     const typeDir = `${socialSaverDir}/${type === 'video' ? 'Videos' : type === 'audio' ? 'Audio' : 'Images'}`;
    
//     // Ensure directories exist
//     await FileSystem.makeDirectoryAsync(typeDir, { intermediates: true });
//     console.log('✅ Directory ensured:', typeDir);
    
//     const targetPath = `${typeDir}/${fileName}`;
//     console.log('Target path:', targetPath);
    
//     // Copy file from cache to target location
//     console.log('Copying file from cache to target location...');
//     await FileSystem.copyAsync({
//       from: fileUri,
//       to: targetPath
//     });
    
//     console.log('✅ File copied successfully');
    
//     // Verify the file was copied
//     const targetFileInfo = await FileSystem.getInfoAsync(targetPath);
//     if (!targetFileInfo.exists) {
//       throw new Error('File copy verification failed');
//     }
    
//     console.log('✅ File copy verified, size:', targetFileInfo.size);
    
//     return targetPath;
//   } catch (error) {
//     console.error('❌ Error saving to downloads:', error);
//     throw error;
//   }
// };

// const saveToMovies = async (
//   fileUri: string,
//   fileName: string,
//   type: 'video' | 'audio' | 'image'
// ): Promise<string | null> => {
//   try {
//     console.log('🎬 Saving to Movies folder...');
    
//     // For now, use document directory structure
//     // In a production app, you might want to use Storage Access Framework on Android
//     const baseDir = FileSystem.documentDirectory;
//     const moviesDir = `${baseDir}Movies/SocialSaver`;
    
//     await FileSystem.makeDirectoryAsync(moviesDir, { intermediates: true });
//     console.log('✅ Movies directory ensured:', moviesDir);
    
//     const targetPath = `${moviesDir}/${fileName}`;
//     console.log('Target path:', targetPath);
    
//     await FileSystem.copyAsync({
//       from: fileUri,
//       to: targetPath
//     });
    
//     console.log('✅ File copied to Movies folder');
    
//     return targetPath;
//   } catch (error) {
//     console.error('❌ Error saving to movies:', error);
//     throw error;
//   }
// };

// const saveToMusic = async (
//   fileUri: string,
//   fileName: string,
//   type: 'video' | 'audio' | 'image'
// ): Promise<string | null> => {
//   try {
//     console.log('🎵 Saving to Music folder...');
    
//     const baseDir = FileSystem.documentDirectory;
//     const musicDir = `${baseDir}Music/SocialSaver`;
    
//     await FileSystem.makeDirectoryAsync(musicDir, { intermediates: true });
//     console.log('✅ Music directory ensured:', musicDir);
    
//     const targetPath = `${musicDir}/${fileName}`;
//     console.log('Target path:', targetPath);
    
//     await FileSystem.copyAsync({
//       from: fileUri,
//       to: targetPath
//     });
    
//     console.log('✅ File copied to Music folder');
    
//     return targetPath;
//   } catch (error) {
//     console.error('❌ Error saving to music:', error);
//     throw error;
//   }
// };

// // Helper function to list all saved files
// export const listSavedFiles = async (): Promise<void> => {
//   try {
//     console.log('=== LISTING SAVED FILES ===');
    
//     const baseDir = FileSystem.documentDirectory;
//     const socialSaverDir = `${baseDir}SocialSaver`;
    
//     const dirInfo = await FileSystem.getInfoAsync(socialSaverDir);
//     if (!dirInfo.exists) {
//       console.log('No SocialSaver directory found');
//       return;
//     }
    
//     const contents = await FileSystem.readDirectoryAsync(socialSaverDir);
//     console.log('SocialSaver directory contents:', contents);
    
//     for (const item of contents) {
//       const itemPath = `${socialSaverDir}/${item}`;
//       const itemInfo = await FileSystem.getInfoAsync(itemPath);
      
//       if (itemInfo.isDirectory) {
//         console.log(`📁 Directory: ${item}`);
//         const subContents = await FileSystem.readDirectoryAsync(itemPath);
//         console.log(`  Files: ${subContents.length}`);
//         subContents.forEach(file => console.log(`    - ${file}`));
//       } else {
//         console.log(`📄 File: ${item} (${itemInfo} bytes)`);
//       }
//     }
//   } catch (error) {
//     console.error('Error listing saved files:', error);
//   }
// };


import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { Platform, Alert } from 'react-native';
import { v4 as uuidv4 } from 'uuid';
import { checkPermissions, requestMediaLibraryPermissions } from './permissions';

const APP_FOLDER_NAME = 'SocialSaver';
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
    await Promise.all([
      createAlbumIfNotExists(APP_FOLDER_NAME),
      createAlbumIfNotExists(VIDEO_FOLDER_NAME),
      createAlbumIfNotExists(AUDIO_FOLDER_NAME),
      createAlbumIfNotExists(IMAGE_FOLDER_NAME),
    ]);
  } catch (error) {
    console.error('Error setting up folders:', error);
  }
};

const createAlbumIfNotExists = async (
  albumName: string
): Promise<MediaLibrary.Album | null> => {
  try {
    let album = await MediaLibrary.getAlbumAsync(albumName);
    if (!album) {
      const tempFilePath = `${FileSystem.cacheDirectory}temp_${albumName}_${Date.now()}.jpg`;
      await FileSystem.writeAsStringAsync(
        tempFilePath,
        'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
        { encoding: FileSystem.EncodingType.Base64 }
      );
      const asset = await MediaLibrary.createAssetAsync(tempFilePath);
      album = await MediaLibrary.createAlbumAsync(albumName, asset, false);
      await FileSystem.deleteAsync(tempFilePath, { idempotent: true });
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

// const saveToMediaLibrary = async (
//   fileUri: string,
//   fileName: string,
//   type: 'video' | 'audio' | 'image',
//   createAlbum: boolean = true
// ): Promise<string | null> => {
//   try {
//     const hasPermission = await requestMediaLibraryPermissions();
//     if (!hasPermission) {
//       return null;
//     }

//     const asset = await MediaLibrary.createAssetAsync(fileUri);
//     let albumName = VIDEO_FOLDER_NAME;
//     if (type === 'audio') albumName = AUDIO_FOLDER_NAME;
//     if (type === 'image') albumName = IMAGE_FOLDER_NAME;

//       let targetAlbum = await MediaLibrary.getAlbumAsync(albumName);
//       if (!targetAlbum) {
//         console.log(`Album ${albumName} doesn't exist, creating...`);
//         targetAlbum = await createAlbumIfNotExists(albumName);
//         if (!targetAlbum) {
//           throw new Error(`Failed to create album ${albumName}`);
//         }
//       }

    

//     await MediaLibrary.addAssetsToAlbumAsync([asset], targetAlbum, false);

//     return asset.uri;
//   } catch (error) {
//     console.error('Error saving to media library:', error);
//     throw error;
//   }
// };

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

    // Use saveToLibraryAsync instead of createAssetAsync for Android 13+
    if (Platform.OS === 'android') {
      // saveToLibraryAsync doesn't trigger the permission dialog on Android 13+
      await MediaLibrary.saveToLibraryAsync(fileUri);
      return fileUri; // Return the original URI since saveToLibraryAsync doesn't return an asset
    } else {
      // For iOS, use createAssetAsync as normal
      const asset = await MediaLibrary.createAssetAsync(fileUri);
      let albumName = VIDEO_FOLDER_NAME;
      if (type === 'audio') albumName = AUDIO_FOLDER_NAME;
      if (type === 'image') albumName = IMAGE_FOLDER_NAME;

      let targetAlbum = await MediaLibrary.getAlbumAsync(albumName);
      if (!targetAlbum) {
        console.log(`Album ${albumName} doesn't exist, creating...`);
        targetAlbum = await createAlbumIfNotExists(albumName);
        if (!targetAlbum) {
          throw new Error(`Failed to create album ${albumName}`);
        }
      }

      await MediaLibrary.addAssetsToAlbumAsync([asset], targetAlbum, false);
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
