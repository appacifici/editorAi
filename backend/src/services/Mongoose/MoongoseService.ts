import connectMongoDB from "../../database/mongodb/connect";
import Alert from "../../database/mongodb/models/Alert";

async function deleteOldAlerts(cutoffset:number) {
    await connectMongoDB();

    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - cutoffset); // Imposta il cutoff a 48 ore fa

    try {
        const result = await Alert.deleteMany({
            createdAt: { $lt: cutoff } // Seleziona i documenti con `createdAt` minore di (ovvero più vecchi di) 48 ore fa
        });
        console.log('Documenti eliminati:', result.deletedCount);
    } catch (error) {
        console.error('Errore durante l\'eliminazione dei documenti vecchi:', error);
    }
}

export {deleteOldAlerts};