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
          // {
          //   urls: "stun:49.36.186.183:3478",
          // },
          {
            urls: "turn:76.76.21.241:3478",
            username: "meetme",
            credential: "meet123",
          },
          // {
          //   urls: "turn:global.turn.twilio.com:3478?transport=udp",
          //   username: `${process.env.REACT_APP_ID}`,
          //   credential: `${process.env.REACT_APP_AUTH}`,
          // },
          // {
          //   urls: "turn:global.turn.twilio.com:3478?transport=tcp",
          //   username: `${process.env.REACT_APP_ID}`,
          //   credential: `${process.env.REACT_APP_AUTH}`,
          // },
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
