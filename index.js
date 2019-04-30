const request = require('request-promise-native');
const cheerio = require('cheerio');
const _ = require('lodash')

async function getKeywordList() {
    try {
        console.log('실시간 키워드');
        console.log('---------------');
        const keywordObjectArray = [];
        // 네이버 같이 큰 홈페이지들은 User-Agent 검사하므로 다음과 같이 작성
        const body = await request(requestOptions = {
            method: 'GET',
            uri: 'http://www.naver.com/',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.108 Safari/537.36'
            }
        });
        const $ = cheerio.load(body);
        //*[@id="PM_ID_ct"]/div[1]/div[2]/div[2]/div[1]/div/ul
        const getElement = $('#PM_ID_ct > div.header > div.section_navbar > div.area_hotkeyword.PM_CL_realtimeKeyword_base > div.ah_list.PM_CL_realtimeKeyword_list_base > ul > li');

        // 디버그
        // console.log(getElement);

        // 전체 리스트 생성
        getElement.each(function () {
            // 임시 객체 생성
            const keywordData = {};
            keywordData.num = $(this).find('a').find($('.ah_r')).text();
            keywordData.text = $(this).find('a').find($('.ah_k')).text();
            keywordData.link = $(this).find('a').attr('href');
            keywordObjectArray.push(keywordData); 
        });

        console.log('실시간 검색어 데이터 받아오기 성공');

        return keywordObjectArray;

    } catch (error) {
        console.log(error);
    }
}

function getRelatedKeywordList(keywordList) {
    try {
        console.log('관련 키워드 조회');
        console.log('-----------------');
        return Promise.all(_.map(keywordList, async (keyword) => {
            const body = await request({
                method: 'GET',
                uri: keyword.link,
                headers: {
                    'accept': '*/*',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.108 Safari/537.36'
                }
            })
            const $ = cheerio.load(body);
            const getElement = $('#nx_related_keywords > dl > dd.lst_relate._related_keyword_list > ul > li');
            const relatedKeywordArray = [];
            getElement.each(function () {
                relatedKeywordArray.push($(this).find('a').text());
            });
            keyword.relatedKeywords = relatedKeywordArray;

            return keyword;
        }));
    } catch (error) {
        // ....
    }
}


async function key() {
    try {
        console.log('관련 키워드 검색중....');
        console.log('-----------------');

        const keywordList = await getKeywordList();
        // 10개 뽑기
        const relatedKeywordsList = _.slice(await getRelatedKeywordList(keywordList), 0, 10);
        _.map(relatedKeywordsList, (keyword) => {
            console.log('-----------------');
            console.log(keyword.num + '위 : ' + keyword.text);
            console.log('연관 검색어 :');
            _.map(keyword.relatedKeywords, (relatedKeyword) => {
                console.log(relatedKeyword);
            });
            console.log('-----------------');
        });
    } catch (error) {
        console.log(error);
    }
}

key();