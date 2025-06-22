    // pages/api/sensor/stats.js
    import { getDatabase } from '../../../../lib/database';

    export default async function handler(req, res) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        const db = await getDatabase();
        const stats = await db.getStats();

        res.status(200).json({ 
        success: true, 
        stats: {
            ...stats,
            avg_temp: stats.avg_temp ? parseFloat(stats.avg_temp.toFixed(1)) : null,
            avg_humidity: stats.avg_humidity ? parseFloat(stats.avg_humidity.toFixed(1)) : null,
            avg_light: stats.avg_light ? parseInt(stats.avg_light) : null
        }
        });

    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ 
        success: false, 
        error: 'Internal server error' 
        });
    }
    }
