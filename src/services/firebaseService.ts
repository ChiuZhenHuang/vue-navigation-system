import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { ref, set, get, push, update } from 'firebase/database';
import { auth, db } from './firebaseConfig';
import type { User } from '@/types/firebaseType';
import type { userData } from '@/types/userType';

// 註冊用戶
export const registerUser = async ({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const newKey = user.uid;

    await set(ref(db, 'users/' + newKey), {
      name,
      email,
      id: newKey,
    });

    return { success: true, uid: newKey, email, name };
  } catch (error: unknown) {
    if (error instanceof Error && 'code' in error) {
      return {
        success: false,
        code: (error as { code: string }).code,
        message: error.message,
      };
    }
    return {
      success: false,
      code: 'unknown',
      message: error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
};

// 登入用戶
export const loginUser = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<userData> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    const userSnapshot = await get(ref(db, 'users/' + firebaseUser.uid));
    const userData = userSnapshot.val();

    if (userData) {
      return {
        success: true,
        uid: firebaseUser.uid,
        token: await firebaseUser.getIdToken(),
        userName: userData.name || null,
        email: userData.email,
      };
    }
    return { success: false, error: 'User data not found' };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
};

// 獲取所有用戶資料
export const getUsersData = async () => {
  try {
    const snapshot = await get(ref(db, 'users'));
    const usersObject = snapshot.val() || {};
    const usersArray = Object.entries(usersObject).map(([key, value]) => {
      const userData = value as User;
      const records = userData.records
        ? Object.entries(userData.records).map(([recordKey, recordValue]) => ({
            ...(recordValue as Record<string, any>),
            id: recordKey,
          }))
        : [];
      return { id: key, name: userData.name, email: userData.email, records };
    });
    return usersArray;
  } catch (error: unknown) {
    throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
  }
};

// 保存用戶記錄
export const saveUserRecord = async ({
  userId,
  action,
  timestamp,
}: {
  userId: string;
  action: string;
  timestamp: number;
}) => {
  try {
    const userRecordsRef = ref(db, 'users/' + userId + '/records');
    const newRecordRef = push(userRecordsRef);
    const recordData = { action, timestamp };
    await set(newRecordRef, recordData);
    return { success: true };
  } catch (error: unknown) {
    throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
  }
};

// 獲取用戶記錄
export const getUserRecords = async (
  userId: string
): Promise<{ name: string; email: string; records: { id: string }[] | null }> => {
  if (!userId) return { name: '', email: '', records: null };

  try {
    const snapshot = await get(ref(db, `users/${userId}`));
    const userData = snapshot.val();

    if (userData) {
      const { name, email, records } = userData;
      const recordsArray = records
        ? Object.entries(records).map(([key, value]) => ({
            ...(value as Record<string, any>),
            id: key,
          }))
        : []; // 確保當 records 為 null 時，會回傳空陣列
      return { name, email, records: recordsArray };
    }
    return { name: '', email: '', records: null }; // 如果沒有找到資料，返回空資料結構
  } catch (error: unknown) {
    console.error('Error fetching user records:', error);
    throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
  }
};

// 添加車型
export const addCarTypes = async ({ carType, oil }: { carType: string; oil: string }) => {
  try {
    const snapshot = await get(ref(db, 'carTypes/' + carType));
    if (snapshot.exists()) {
      return { success: false, message: '此車款已存在' };
    }
    const cartTypeData = { carType, oil };
    await set(ref(db, 'carTypes/' + carType), cartTypeData);
    return { success: true, cartTypeData };
  } catch (error: unknown) {
    throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
  }
};

// 獲取所有車型
export const getCarTypes = async () => {
  try {
    const snapshot = await get(ref(db, 'carTypes'));
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.entries(data).map(([key, value]) => ({
        value: key,
        carType: key,
        oil: (value as { oil: string }).oil,
      }));
    }
    return [];
  } catch (error: unknown) {
    throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
  }
};

// 更新車型
export const updateCarTypes = async ({ carType, oil }: { carType: string; oil: string }) => {
  try {
    const updateData = { oil };
    await update(ref(db, 'carTypes/' + carType), updateData);
    return { success: true, updateData };
  } catch (error: unknown) {
    throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
  }
};
