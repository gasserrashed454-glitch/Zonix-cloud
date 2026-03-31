const axios = require('axios');

class NeuralVoid {
    constructor(nodes) {
        this.nodes = nodes; // Your list of OneDrive accounts
    }

    // This calculates the total free space across all accounts
    async getStatus() {
        let totalFree = 0;
        let nodeData = [];
        for (const node of this.nodes) {
            try {
                const res = await axios.get('https://graph.microsoft.com/v1.0/me/drive', {
                    headers: { Authorization: `Bearer ${node.token}` }
                });
                totalFree += res.data.quota.remaining;
                nodeData.push({ name: node.name, free: res.data.quota.remaining, token: node.token });
            } catch (e) { console.log(`${node.name} is offline`); }
        }
        return { totalFree, nodeData };
    }

    // This finds the account with the most space and uploads there
    async smartUpload(fileName, fileBuffer) {
        const { nodeData } = await this.getStatus();
        const bestNode = nodeData.sort((a, b) => b.free - a.free)[0];
        
        const url = `https://graph.microsoft.com/v1.0/me/drive/root:/${fileName}:/content`;
        return axios.put(url, fileBuffer, {
            headers: { 
                Authorization: `Bearer ${bestNode.token}`,
                'Content-Type': 'application/octet-stream'
            }
        });
    }
}
module.exports = NeuralVoid;
