/* import ES6 mp3 files as module for audio player
    https://webpack.js.org/guides/typescript/#importing-other-assets
 */
declare module "*.mp3" {
    const content: any;
    export default content;
}