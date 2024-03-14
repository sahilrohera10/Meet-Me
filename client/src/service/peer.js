class PeerService {
  constructor() {
    // Initialize peer with empty configuration initially
    this.peer = null;

    // Fetch ICE servers from the API and initialize peer
    this.initPeer();
  }

  async initPeer() {
    const iceServers = await this.fetchIceServers();
    if (iceServers) {
      this.peer = new RTCPeerConnection({
        iceServers: iceServers,
      });
    } else {
      console.error("Failed to fetch ICE servers");
    }
  }

  async fetchIceServers() {
    try {
      const response = await fetch(
        "https://scimeet.metered.live/api/v1/turn/credentials?apiKey=10ef8a6a4f7d190368963d9362b79daf56fa"
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching ICE servers:", error);
      return null;
    }
  }

  async getAnswer(offer) {
    if (this.peer) {
      await this.peer.setRemoteDescription(offer);
      const ans = await this.peer.createAnswer();
      await this.peer.setLocalDescription(new RTCSessionDescription(ans));
      return ans;
    }
  }

  async setLocalDescription(ans) {
    if (this.peer) {
      await this.peer.setRemoteDescription(new RTCSessionDescription(ans));
    }
  }

  async getOffer() {
    if (this.peer) {
      const offer = await this.peer.createOffer();
      await this.peer.setLocalDescription(new RTCSessionDescription(offer));
      return offer;
    }
  }
}

export default new PeerService();
