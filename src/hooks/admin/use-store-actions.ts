
import { collection, doc, addDoc, updateDoc, deleteDoc, serverTimestamp, increment, runTransaction } from 'firebase/firestore';
import { type StoreItem } from '../use-admin';

export const useStoreActions = (db: any, toast: any) => {
    const createCreditPack = (p: any) => addDoc(collection(db, 'creditPacks'), { ...p, createdAt: serverTimestamp() });
    const updateCreditPack = (id: string, d: any) => updateDoc(doc(db, 'creditPacks', id), d);
    const deleteCreditPack = (id: string) => deleteDoc(doc(db, 'creditPacks', id));

    const createStoreItem = (i: any) => addDoc(collection(db, 'storeItems'), { ...i, createdAt: serverTimestamp() });
    const updateStoreItem = (id: string, d: any) => updateDoc(doc(db, 'storeItems', id), d);
    const deleteStoreItem = (id: string) => deleteDoc(doc(db, 'storeItems', id));

    const redeemStoreItem = async (item: StoreItem, quantity: number, userId: string) => {
        const total = item.cost * quantity;
        await runTransaction(db, async (t) => {
            const uRef = doc(db, 'users', userId);
            const iRef = doc(db, 'storeItems', item.id);
            const uS = await t.get(uRef);
            if (uS.data()!.credits < total && !(uS.data()!.masterCardExpires && new Date(uS.data()!.masterCardExpires) > new Date())) throw new Error("Credits needed.");
            t.update(iRef, { stock: increment(-quantity) });
            t.update(uRef, { credits: increment(-total) });
        });
    };

    const processStoreItemPayment = async (item: StoreItem, quantity: number, userId: string, method: 'razorpay' | 'wallet') => {
        const userRef = doc(db, 'users', userId);
        if (method === 'wallet') {
            await updateDoc(userRef, { walletBalance: increment(-item.price! * quantity) });
        }
    };

    return {
        createCreditPack, updateCreditPack, deleteCreditPack,
        createStoreItem, updateStoreItem, deleteStoreItem,
        redeemStoreItem, processStoreItemPayment
    };
};
