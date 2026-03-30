
import { collection, doc, setDoc, updateDoc, deleteDoc, serverTimestamp, increment, runTransaction, arrayUnion } from 'firebase/firestore';

export const useCodeActions = (db: any, toast: any) => {
    const generateRedeemCode = async (value: number) => {
        // Generate a legendary 12-character encrypted string
        const part1 = Math.random().toString(36).substring(2, 6).toUpperCase();
        const part2 = Math.random().toString(36).substring(2, 6).toUpperCase();
        const part3 = Math.random().toString(36).substring(2, 6).toUpperCase();
        const code = `MM-${part1}-${part2}-${part3}`;

        await setDoc(doc(db, 'redeemCodes', code), {
            id: code,
            value,
            status: 'active',
            createdAt: serverTimestamp()
        });
        
        return code;
    };

    const deactivateRedeemCode = async (codeId: string) => {
        await updateDoc(doc(db, 'redeemCodes', codeId), { status: 'inactive' });
    };

    const deleteRedeemCode = async (codeId: string) => {
        await deleteDoc(doc(db, 'redeemCodes', codeId));
    };

    const redeemCode = async (userId: string, codeInput: string) => {
        const sanitizedCode = codeInput.trim().toUpperCase();
        
        return await runTransaction(db, async (transaction) => {
            const codeRef = doc(db, 'redeemCodes', sanitizedCode);
            const userRef = doc(db, 'users', userId);
            
            const codeSnap = await transaction.get(codeRef);
            if (!codeSnap.exists()) {
                throw new Error("Invalid Code: Signal not found in MindMate network.");
            }
            
            const codeData = codeSnap.data();
            if (codeData.status !== 'active') {
                throw new Error(`Code Breach: This asset is ${codeData.status === 'redeemed' ? 'already claimed' : 'currently inactive'}.`);
            }
            
            const userSnap = await transaction.get(userRef);
            if (!userSnap.exists()) throw new Error("Mainframe Error: User record corrupted.");

            const amount = codeData.value;
            const txId = `RD-${Date.now()}`;

            // Update Code State
            transaction.update(codeRef, {
                status: 'redeemed',
                redeemedBy: userId,
                redeemedAt: serverTimestamp()
            });

            // Update User Wallet
            transaction.update(userRef, {
                walletBalance: increment(amount),
                walletTransactions: arrayUnion({
                    id: txId,
                    amount: amount,
                    type: 'code_redemption',
                    status: 'completed',
                    date: new Date().toISOString()
                })
            });

            return amount;
        });
    };

    return { generateRedeemCode, deactivateRedeemCode, deleteRedeemCode, redeemCode };
};
