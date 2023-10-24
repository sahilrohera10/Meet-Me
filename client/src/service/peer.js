class PeerService {
  constructor() {
    if (!this.peer) {
      this.peer = new RTCPeerConnection({
        iceServers: [
          {
            urls: [
              "stun:stun.l.google.com:19302",
              "stun:global.stun.twilio.com:3478",
            ],
          },
          {
            urls: "turn:global.turn.twilio.com:3478?transport=udp",
            username: "ACff714228be4150bbad2c56ffc6d2101b",
            credential: "cabd0850c174909ebe230ce2511c840b",
          },
          {
            urls: "turn:global.turn.twilio.com:3478?transport=tcp",
            username: "ACff714228be4150bbad2c56ffc6d2101b",
            credential: "cabd0850c174909ebe230ce2511c840b",
          },
        ],
      });
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
