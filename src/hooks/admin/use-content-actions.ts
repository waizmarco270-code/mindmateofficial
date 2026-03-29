
'use server';
import { db } from '@/lib/firebase';
import { collection, doc, addDoc, updateDoc, deleteDoc, serverTimestamp, writeBatch, getDocs, query, where, Timestamp, increment, arrayUnion } from 'firebase/firestore';

export const useContentActions = (db: any, toast: any) => {
    const addAnnouncement = (a: any) => addDoc(collection(db, 'announcements'), { ...a, createdAt: serverTimestamp() });
    const updateAnnouncement = (id: string, d: any) => updateDoc(doc(db, 'announcements', id), d);
    const deleteAnnouncement = (id: string) => deleteDoc(doc(db, 'announcements', id));

    const addResourceSection = (s: any) => addDoc(collection(db, 'resourceSections'), { ...s, createdAt: serverTimestamp() });
    const updateResourceSection = (id: string, d: any) => updateDoc(doc(db, 'resourceSections', id), d);
    const deleteResourceSection = async (id: string) => {
        const resSnap = await getDocs(query(collection(db, "resources"), where("sectionId", "==", id)));
        const batch = writeBatch(db);
        resSnap.forEach(d => batch.delete(d.ref));
        batch.delete(doc(db, 'resourceSections', id));
        await batch.commit();
    };

    const addResource = (r: any) => addDoc(collection(db, 'resources'), { ...r, createdAt: serverTimestamp() });
    const updateResource = (id: string, d: any) => updateDoc(doc(db, 'resources', id), d);
    const deleteResource = (id: string) => deleteDoc(doc(db, 'resources', id));

    const addDailySurprise = (s: any) => addDoc(collection(db, 'dailySurprises'), { ...s, createdAt: serverTimestamp() });
    const deleteDailySurprise = (id: string) => deleteDoc(doc(db, 'dailySurprises', id));

    const addPoll = (p: any) => addDoc(collection(db, 'polls'), { ...p, isActive: false, results: p.options.reduce((acc: any, o: string) => ({ ...acc, [o]: 0 }), {}), createdAt: serverTimestamp() });
    const deletePoll = (id: string) => deleteDoc(doc(db, 'polls', id));
    const setActivePoll = async (id: string) => {
        const activeSnap = await getDocs(query(collection(db, 'polls'), where('isActive', '==', true)));
        const batch = writeBatch(db);
        activeSnap.forEach(d => batch.update(d.ref, { isActive: false }));
        batch.update(doc(db, 'polls', id), { isActive: true });
        await batch.commit();
    };

    const submitPollVote = async (id: string, opt: string, userId: string) => {
        const batch = writeBatch(db);
        batch.update(doc(db, 'polls', id), { [`results.${opt}`]: increment(1) });
        batch.update(doc(db, 'users', userId), { [`votedPolls.${id}`]: opt });
        await batch.commit();
    };

    const submitPollComment = (id: string, c: string, userId: string, userName: string) => 
        updateDoc(doc(db, 'polls', id), { 
            comments: arrayUnion({ userId, userName, comment: c, createdAt: Timestamp.now() }) 
        });

    const addVideoCategory = (c: any) => addDoc(collection(db, 'videoCategories'), { ...c, createdAt: serverTimestamp() });
    const deleteVideoCategory = (id: string) => deleteDoc(doc(db, 'videoCategories', id));
    const addVideoLecture = (l: any) => addDoc(collection(db, 'videoLectures'), { ...l, createdAt: serverTimestamp() });
    const deleteVideoLecture = (id: string) => deleteDoc(doc(db, 'videoLectures', id));

    return {
        addAnnouncement, updateAnnouncement, deleteAnnouncement,
        addResourceSection, updateResourceSection, deleteResourceSection,
        addResource, updateResource, deleteResource,
        addDailySurprise, deleteDailySurprise,
        addPoll, deletePoll, setActivePoll, submitPollVote, submitPollComment,
        addVideoCategory, deleteVideoCategory, addVideoLecture, deleteVideoLecture
    };
};
