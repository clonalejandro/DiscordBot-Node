const youtubeId = require("get-youtube-id");
const request = require("request");
const ytdl = require("ytdl-core");


class VideoApi {


    /** SMALL CONSTRUCTORS **/
    
    constructor(config){
        this.config = config;
        this.queue = [];
        this.isPlaying = false;
        this.voiceChannel = null;
        this.skipRequest = 0;
        this.skippers = [];
        this.dispatcher = null;
    }


    /** REST **/

    /**
     * This function search the video
     * @param {*} query 
     * @param {*} callback 
     */
    searchVideo(query, callback){
        const baseUrl = "https://www.googleapis.com/youtube/v3/search/?part=id&type=video&q=";
        const nquery = encodeURIComponent(query);
        const key = "&key=" + this.config.tokens.youtube;

        request(baseUrl + nquery + key , (err, res, body) => {
            if (err) throw new Error(err);
            else callback(JSON.parse(body).items[0].id.videoId);
        });
    }


    /**
     * This function play the track or music
     * @param {*} id 
     * @param {*} message 
     */
    playMusic(id, message){
        this.voiceChannel = message.member.voiceChannel;
        if (this.voiceChannel !== null)
            this.voiceChannel.join().then(connection => 
                this.registerDispatcher(id, connection, message)
            );
    }


    skipMusic(message){
        this.dispatcher.end();
        if (this.queue.length > 1) {
            this.playMusic(this.queue[0], message);
            console.log("first");//debug ignore
        } 
        else {
            console.log("second");//debug ignore
            this.resetSkipBuffer();
        } 
    }


    /**
     * This function register the dispatcher
     * @param {*} id 
     * @param {*} connection 
     * @param {*} message
     * @returns {*} dispatcher
     */
    registerDispatcher(id, connection, message){
        const stream = ytdl("https://www.youtube.com/watch?v=" + id, {filter:'audioonly'});

        this.resetSkipBuffer();
        this.dispatcher = connection.playStream(stream);
        
        this.dispatcher.on('end', () => {
            this.resetSkipBuffer();
            this.queue.shift();

            if (this.queue.length === 0){
                this.queue = [];
                this.isPlaying = false;
            }
            else this.playMusic(this.queue[0], message);
        });

        return this.dispatcher;
    }


    /**
     * This function reset the skip buffer
     */
    resetSkipBuffer(){
        this.skipRequest = 0;
        this.skippers = [];
    }


    /** GETTERS **/

    /**
     * This function returns a queue of music
     * @returns {Array} queue
     */
    getQueue(){
        return this.queue
    }


    /**
     * This function returns a queue of players wants to skip the track or music
     * @returns {Array} skippers
     */
    getSkippers(){
        return this.skippers
    }


    /**
     * This function returns if the track or music is playing
     * @returns {boolean} isPlaying
     */
    getIsPlaying(){
        return this.isPlaying
    }


    /**
     * This function get the video Id and call the callback
     * @param {string} str 
     * @param {*} callback 
     */
    getId(str, callback){
        if (this.isYoutube(str)) callback(youtubeId(str));
        else this.searchVideo(str, id => callback(id));
    }


    /**
     * This function returns a skipRequest
     * @returns {number} skipRequest
     */
    getSkipRequest(){
        return this.skipRequest
    }


    /**
     * This function returns a voiceChannel
     * @returns {*} voiceChannel
     */
    getVoiceChannel(){
        return this.voiceChannel
    }


    /**
     * This function check if this music is from YouTube
     * @param {string} musicUri 
     */
    isYoutube(musicUri){
        return musicUri.toLowerCase().indexOf("youtube.com") > -1;
    }


    /** SETTERS **/

    /**
     * This function set if the track or music is playing
     * @param {boolean} playing
     */
    setIsPlaying(playing){
        this.isPlaying = playing;
    }


    /**
     * This function add data to queue
     * @param {*} data 
     */
    directQueue(data){
        this.queue.push(data);
    }


    /**
     * This function add music to queue
     * @param {string} strId 
     */
    addToQueue(strId){
        if (this.isYoutube(strId)) this.queue.push(this.getId(strId));
        else this.queue.push(strId);
    }


    /**
     * This function add to skippers a data
     * @param {*} data 
     */
    addToSkippers(data){
        this.skippers.push(data);
        this.skipRequest++;
    }


}


module.exports = VideoApi;