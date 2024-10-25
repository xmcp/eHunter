import { ImgPageInfo } from '../../../../core/bean/ImgPageInfo'
import { ThumbInfo, ThumbMode } from '../../../../core/bean/ThumbInfo'

// a parser for album's intro page
export class IntroHtmlParser {
    private html: HTMLElement;
    private reqUrl: string;

    constructor(html, reqUrl) {
        this.html = document.createElement('html');
        this.reqUrl = reqUrl; // the request url. It's maybe different with introUrl in more thumbs mode
        this.html.innerHTML = html.replace(/src=/g, 'x-src='); // avoid load assets
        // this.document = this.html.ownerDocument!;
    }

    getImgUrls(): Array<ImgPageInfo> {
        if (this._isValidIntroPage()) {
            return Array.from(this.html.querySelectorAll('.gt200>a')).map(item => {
                item.querySelector('div')!.getAttribute('style')!.match(/width:(.*?)px;\s*height:(.*?)px;/);
                const thumbHeight = Number(RegExp.$2);
                const thumbWidth = Number(RegExp.$1);
                let pageUrl = item.getAttribute('href')!.match(/\/s.*$/) + '';
                return {
                    id: pageUrl,
                    index: 0,
                    pageUrl,
                    src: '',
                    thumbHeight,
                    thumbWidth,
                    heightOfWidth: thumbHeight / thumbWidth
                };
            })
        } else {
            return [];
        }
    }

    getThumbObjList(): Array<ThumbInfo> {
        if (this._isValidIntroPage()) {
            return Array.from(this.html.querySelectorAll('.gt200>a>div')).map(div=>{
                let url_s = (div as HTMLDivElement).style.backgroundImage;
                if(url_s && url_s.startsWith('url("')) {
                    let url = url_s.substring(5, url_s.length - 2);
                    return {
                        id: url,
                        src: url,
                        mode: ThumbMode.IMG,
                    };
                }
                else
                    return {
                        id: '',
                        src: '',
                        mode: ThumbMode.IMG,
                    };
            }).filter(x=>x.src!=='');
        } else {
            return [];
        }
    }

    _getTruePageIndex() {
        return Number(this.html.getElementsByClassName('ptds')[0].textContent) - 1;
    }

    _isValidIntroPage() {
        // In more thumbs mode, it will have many repeated intro page requests because the error of count of intro pages.
        // For the speed first, I don't fix the bug of the error, but discard the repeated intro page requests by validating
        // index.
        if (this.reqUrl && this.reqUrl.includes('?p=')) {
            let reqIndex = Number(this.reqUrl!.match(/\?p=[0-9]+/g)![0].replace('?p=', ''));
            if (this._getTruePageIndex() !== reqIndex) {
                return false;
            }
        }
        return true;
    }
}