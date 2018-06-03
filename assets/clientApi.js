
const youtubeInfo = require("youtube-info");
const videoApi = require ("./videoApi");


class ClientApi {
    
    
    /** SMALL CONSTRUCTORS **/

    constructor (client, config){
        this.client = client;
        this.config = config;
        this.videoApi = new videoApi(config);
    }


    /** REST **/

    /**
     * This function init the app
     */
    startApp(){
        this.client.on('ready', () => {
            console.log("Readyy!: " + this.config.tokens.discord)
        });
    }


    /**
     * This function register a client messages and returns a message props
     * @return {*} props
     */
    registerClientMessages(){
        let props = null;

        this.client.on('message', (message) => {
            props = message;
            
            const member = message.member;
            const messaje = message.content.toLowerCase();
            const args = message.content.split(' ').slice(1).join(" ");

            if (messaje.startsWith(this.config.prompt + "play")){
                if (this.videoApi.getQueue().length > 0 || this.videoApi.getIsPlaying()){
                    this.videoApi.getId(args, (id) => {
                        this.videoApi.addToQueue(id);
                        
                        youtubeInfo(id, (err, res) => {
                            if (err) throw new Error(err);
                            message.reply(" added to queue: **" + res.title + "**")
                        })
                    })
                }
                else {
                    this.videoApi.setIsPlaying(true);
                    this.videoApi.getId(args, (id) => {
                        this.videoApi.directQueue("placeholder");
                        this.videoApi.playMusic(id, message);

                        youtubeInfo(id, (err, res) => {
                            if (err) throw new Error(err);
                            message.reply(" now playing: **" + res.title + "**")
                        })
                    })
                } 
            }
            else if (messaje.startsWith(this.config.prompt + "skip"))
                if (this.videoApi.getSkippers().indexOf(message.author.id) === -1) {
                    this.videoApi.addToSkippers(message.author.id);
                    
                    if (this.videoApi.getSkipRequest() >= this.getChannelAproxSize()){
                        this.videoApi.skipMusic(message);
                        message.reply(" your skip has been acknowledged. Skipping now!");
                    }
                    else message.reply(" your skip has been acknowledged. You need **" +
                        (this.getChannelAproxSize() - this.videoApi.getSkipRequest()) + "** more skip votes!");
                } 
                else message.reply(" you already voted to skip!")
        });

        return props;
    }


    /**
     * This function returns a abstract number
     * @returns {number} aproxSize
     */
    getChannelAproxSize(){
        return Math.ceil((this.videoApi.getVoiceChannel().members.size - 1) / 2)
    }


}


module.exports = ClientApi; 