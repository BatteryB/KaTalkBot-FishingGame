const SQLite = require('SQLite');
let sql = new SQLite();
sql.open('your DB file path'); // DB 파일 경로 설정 필수 / DB file path setting required

const prefix = '!';

const level_1 = ['붕어', '송어'];
const level_2 = ['잉어', '베스'];
const level_3 = ['참돔', '명태'];
const level_4 = ['연어', '돌돔'];
const level_5 = ['농어', '전어'];
const level_6 = ['메기', '오징어'];
const level_7 = ['철갑상어', '무지개송어'];

function responseFix(room, msg, sender, isGroupChat, replier, imageDB, packageName) {
    if (room == 'your room name') {
        if (msg == prefix + '낚시' || msg == prefix + '낚시 명령어') {
            replier.reply(help());
        }

        if (msg == prefix + '낚시 가입') {
            let findedUser = findUser(sender);
            if (findedUser == false) {
                sql.query('INSERT INTO USER VALUES("' + sender + '", 1, 0, 0, 0)');
                sql.query('INSERT INTO FISH VALUES("' + sender + '", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)');
                sql.query('INSERT INTO ITEM VALUES("' + sender + '", 100, 100)');
                sql.query('INSERT INTO WHETHER VALUES("' + sender + '", 0, 0, 0)');
                replier.reply('가입 완료 되었습니다.');
                replier.reply('*주의*\n닉네임 변경 시 계정을 못 찾을 수 있습니다.');
            } else {
                replier.reply(sender + '님은 이미 가입되어 있습니다.');
            }
        }

        if (msg == prefix + '낚시 시작') {
            let whether = Whether(sender);
            if (whether == false) {
                let catchable = checkRodLevel(sender);
                let catchFish = Math.floor(Math.random() * catchable.length);
                let randomTime = Math.floor(Math.random() * 20001) + 10000;
                sql.query('UPDATE WHETHER SET FISHING_WHETHER = 1 WHERE NAME = "' + sender + '"');
                replier.reply(sender + '이(가) 낚싯줄을 힘차게 던졌다.\n물고기가 낚일 때 까지 기다려보자...');
                setTimeout(() => replier.reply(sender + '이(가) ' + catchable[catchFish] + '를 낚았다!'), randomTime);
                setTimeout(() => sql.query('UPDATE FISH SET "' + catchable[catchFish] + '" = "' + catchable[catchFish] + '" + 1 WHERE NAME = "' + sender + '"'), randomTime);
                setTimeout(() => sql.query('UPDATE WHETHER SET FISHING_WHETHER = 0 WHERE NAME = "' + sender + '"'), randomTime);
            } else if (whether == true) {
                replier.reply(sender + '님은 이미 다른 활동을 하고 있습니다');
            } else {
                replier.reply('먼저 가입을 해주세요.');
            }
        }

        if (msg.startsWith(prefix + '낚시 활동 ')) {
            let findedUser = findUser(sender);
            let whether = Whether(sender);
            if (findedUser == true) {
                if (whether == false) {
                    let active = msg.substr(7);
                    let durability = sql.query('SELECT 장갑, 곡괭이 FROM ITEM WHERE NAME = "' + sender + '"');
                    durability.moveToFirst();
                    let item = {
                        장갑: durability.getInt(0),
                        곡괭이: durability.getInt(1)
                    };
                    if (active == '채집') {
                        if (item.장갑 >= 20) {
                            let collectTime = Math.floor(Math.random() * 30001) + 15000;
                            replier.reply(sender + '은(는) 실을 채집하기 위해 자연으로 떠났다.');
                            sql.query('UPDATE WHETHER SET COLLECTING_WHETHER = 1 WHERE NAME = "' + sender + '"');
                            setTimeout(() => replier.reply(sender + '이(가) 자연에서 돌아왔다.\n실 +1\n장갑 내구도 -20%'), collectTime);
                            sql.query('UPDATE USER SET THREAD = THREAD + 1 WHERE NAME = "' + sender + '"');
                            sql.query('UPDATE ITEM SET 장갑 = 장갑 - 20 WHERE NAME = "' + sender + '"');
                            setTimeout(() => sql.query('UPDATE WHETHER SET COLLECTING_WHETHER = 0 WHERE NAME = "' + sender + '"'), collectTime);
                        } else {
                            replier.reply('채집을 하기 위한 장갑의 최소한의 내구도가 부족합니다.');
                        }
                    } else if (active == '채광') {
                        if (item.곡괭이 >= 10) {
                            let miningTime = Math.floor(Math.random() * 30001) + 30000;
                            replier.reply(sender + '은(는) 철 채광을 위해 동굴로 들어갔다.');
                            sql.query('UPDATE WHETHER SET MINING_WHETHER = 1 WHERE NAME = "' + sender + '"');
                            setTimeout(() => replier.reply(sender + '이(가) 동굴에서 나왔다.\n철조각 +1\n곡괭이 내구도 -10%'), miningTime);
                            sql.query('UPDATE USER SET IRONPIECE = IRONPIECE + 1 WHERE NAME = "' + sender + '"');
                            sql.query('UPDATE ITEM SET 곡괭이 = 곡괭이 - 10 WHERE NAME = "' + sender + '"');
                            setTimeout(() => sql.query('UPDATE WHETHER SET MINING_WHETHER = 0 WHERE NAME = "' + sender + '"'), miningTime);

                        } else {
                            replier.reply('채광을 하기 위한 곡괭이의 최소한의 내구도가 부족합니다.');
                        }
                    } else {
                        replier.reply('해당 활동은 존재하지 않습니다.');
                    }
                } else {
                    replier.reply(sender + '님은 이미 다른 활동을 하고 있습니다');
                }
            } else {
                replier.reply('먼저 가입을 해주세요.');
            }
        }

        if (msg == prefix + '낚시 인벤') {
            let findedUser = findUser(sender);
            if (findedUser == true) {
                let userInfo = sql.query('SELECT * FROM USER WHERE NAME = "' + sender + '"');
                let userFish = sql.query('SELECT * FROM FISH WHERE NAME = "' + sender + '"');
                let userItem = sql.query('SELECT * FROM ITEM WHERE NAME = "' + sender + '"');
                userInfo.moveToFirst();
                userFish.moveToFirst();
                userItem.moveToFirst();
                let info = {
                    name: userInfo.getString(0),
                    fishingRod: userInfo.getInt(1),
                    money: userInfo.getInt(2),
                    thread: userInfo.getInt(3),
                    ironPiece: userInfo.getInt(4)
                };

                let fish = {
                    name: userFish.getString(0),
                    붕어: userFish.getInt(1),
                    송어: userFish.getInt(2),
                    잉어: userFish.getInt(3),
                    베스: userFish.getInt(4),
                    참돔: userFish.getInt(5),
                    명태: userFish.getInt(6),
                    연어: userFish.getInt(7),
                    돌돔: userFish.getInt(8),
                    농어: userFish.getInt(9),
                    전어: userFish.getInt(10),
                    메기: userFish.getInt(11),
                    오징어: userFish.getInt(12),
                    철갑상어: userFish.getInt(13),
                    무지개송어: userFish.getInt(14)
                };

                let item = {
                    name: userItem.getString(0),
                    장갑: userItem.getInt(1),
                    곡괭이: userItem.getInt(2)
                };
                replier.reply(info.name + '\n낚싯대 레벨: ' + info.fishingRod + '\n돈: ' + info.money + '원​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​\n​\n장갑 내구도: ' + item.장갑 + '%\n곡괭이 내구도: ' + item.곡괭이 + '%\n실: ' + info.thread + '\n철조각: ' + info.ironPiece + '\n\n붕어: ' + fish.붕어 + '\n송어: ' + fish.송어 + '\n잉어: ' + fish.잉어 + '\n베스: ' + fish.베스 + '\n참돔: ' + fish.참돔 + '\n명태: ' + fish.명태 + '\n연어: ' + fish.연어 + '\n돌돔: ' + fish.돌돔 + '\n농어: ' + fish.농어 + '\n전어: ' + fish.전어 + '\n메기: ' + fish.메기 + '\n오징어: ' + fish.오징어 + '\n철갑상어: ' + fish.철갑상어 + '\n무지개송어: ' + fish.무지개송어);
            } else {
                replier.reply('먼저 가입을 해주세요.');
            }
        }

        if (msg == prefix + '낚시 가격표') {
            replier.reply(priceList());
        }

        if (msg == prefix + '낚시 상점') {
            let findedUser = findUser(sender);
            if (findedUser == true) {
                replier.reply(shopHelp());
            } else {
                replier.reply('먼저 가입을 해주세요.');
            }
        }

        if (msg.startsWith(prefix + '낚시 판매 ')) {
            let findedUser = findUser(sender);
            if (findedUser == true) {
                let salesList = msg.substr(7);
                let salesTag = salesList.split(' ');
                let sales = checkingFish(salesTag);
                let countFish = sql.query('SELECT ' + String(salesTag[0]) + ' FROM FISH WHERE NAME = "' + sender + '"');
                countFish.moveToFirst();
                let userFish = {
                    fish: countFish.getInt(0)
                }

                if (Number(salesTag[1]) <= userFish.fish) {
                    sql.query('UPDATE FISH SET ' + String(salesTag[0]) + ' = ' + String(salesTag[0]) + ' - ' + Number(salesTag[1]) + ' WHERE NAME = "' + sender + '"');
                    sql.query('UPDATE USER SET MONEY = MONEY + ' + sales * Number(salesTag[1]) + ' WHERE NAME = "' + sender + '"');
                    replier.reply('판매 완료\n' + salesTag[0] + ' -' + salesTag[1] + '\n돈 +' + sales * salesTag[1]);
                } else {
                    replier.reply(salesTag[0] + '의 갯수가 부족합니다.');
                }

            } else {
                replier.reply('먼저 가입을 해주세요.');
            }
        }

        if (msg.startsWith(prefix + '낚시 일괄 판매 ')) {
            let findedUser = findUser(sender);
            if (findedUser == true) {
                let fish = String(msg.substr(10));
                let checkFish = sql.query('SELECT ' + fish + ' FROM FISH WHERE NAME = "' + sender + '"');
                checkFish.moveToFirst();
                let userFish = {
                    fish: checkFish.getInt(0)
                };
                let Parameters = [fish];
                let sales = checkingFish(Parameters);
                sql.query('UPDATE FISH SET ' + fish + ' = ' + fish + ' - ' + Number(userFish.fish) + ' WHERE NAME = "' + sender + '"');
                sql.query('UPDATE USER SET MONEY = MONEY + ' + Number(userFish.fish) * sales + ' WHERE NAME = "' + sender + '"');

                replier.reply(sender + '\n' + fish + ' 일괄판매 완료\n' + fish + ' -' + userFish.fish + '\n돈 +' + Number(userFish.fish) * sales);
            } else {
                replier.reply('먼저 가입을 해주세요.');
            }
        }

        if (msg == prefix + '낚시 강화') {
            let findedUser = findUser(sender);
            if (findedUser == true) {
                let fishingRod = sql.query('SELECT FISHINGROD FROM USER WHERE NAME = "' + sender + '"');
                fishingRod.moveToFirst();
                let rodLevel = {
                    rod: fishingRod.getInt(0)
                };

                let upRod = rodLevelup(rodLevel);
                let checkMoney = sql.query('SELECT MONEY, THREAD, IRONPIECE FROM USER WHERE NAME = "' + sender + '"');
                checkMoney.moveToFirst();
                let userMoney = {
                    money: checkMoney.getInt(0),
                    thread: checkMoney.getInt(1),
                    ironPiece: checkMoney.getInt(2)
                };

                if (upRod == false) {
                    replier.reply(sender + '님의 낚싯대는 이미 최고 레벨 입니다.');
                } else if (upRod[0] > userMoney.money) {
                    replier.reply(Number(upRod[0]) - userMoney.money + '원 이 부족합니다.');
                } else if (upRod[1] > userMoney.thread) {
                    replier.reply('실이 부족합니다.');
                } else if (upRod[2] > userMoney.ironPiece) {
                    replier.reply('철조각이 부족합니다.');
                } else if (userMoney.money >= upRod[0] && userMoney.thread >= upRod[1] && userMoney.ironPiece >= upRod[2]) {
                    sql.query('UPDATE USER SET FISHINGROD = FISHINGROD + 1, MONEY = MONEY - ' + Number(upRod[0]) + ', THREAD = THREAD - ' + Number(upRod[1]) + ', IRONPIECE = IRONPIECE - ' + Number(upRod[2]) + ' WHERE NAME = "' + sender + '"');
                    let checkMoney = sql.query('SELECT MONEY FROM USER WHERE NAME = "' + sender + '"');
                    checkMoney.moveToFirst();
                    let Rod = {
                        rod: fishingRod.getInt(0)
                    };
                    let level = Rod.rod + 1;
                    if (Rod.rod < 4) {
                        replier.reply(sender + '님의 낚싯대가 ' + level + '레벨로 강화되었습니다.\n돈 -' + upRod[0]);
                        replier.reply('이제 ' + upRod[3] + ', ' + upRod[4] + '를 낚을 수 있게 되었습니다.');
                    } else if (Rod.rod <= 7) {
                        replier.reply(sender + '님의 낚싯대가 ' + level + '레벨로 강화 되었습니다.\n돈 -' + upRod[0] + '\n실 -' + upRod[1] + '\n철조각 -' + upRod[2]);
                        replier.reply('이제 ' + upRod[3] + ', ' + upRod[4] + '를 낚을 수 있게 되었습니다.');
                    }
                } 
            } else {
                replier.reply('먼저 가입을 해주세요.');
            }
        }

        if (msg.startsWith(prefix + '낚시 수리 ')) {
            let findedUser = findUser(sender);
            if (findedUser == true) {
                let tool = msg.substr(7);
                let checkMoney = sql.query('SELECT MONEY FROM USER WHERE NAME = "' + sender + '"');
                let checkTool = sql.query('SELECT * FROM ITEM WHERE NAME = "' + sender + '"');
                checkMoney.moveToFirst();
                checkTool.moveToFirst();
                let money = {
                    money: checkMoney.getInt(0)
                };
                let userTool = {
                    name: checkTool.getString(0),
                    장갑: checkTool.getInt(1),
                    곡괭이: checkTool.getInt(2)
                };
                if (tool == '장갑') {
                    if (userTool.장갑 == 100) {
                        replier.reply('이미 장갑의 내구도가 100% 입니다.');
                    } else if (money.money >= 8000) {
                        sql.query('UPDATE ITEM SET 장갑 = 100 WHERE NAME = "' + sender + '"');
                        sql.query('UPDATE USER SET MONEY = MONEY - 8000 WHERE NAME = "' + sender + '"');
                        replier.reply(sender + '님의 장갑이 수리되었습니다.\n돈 -8000\n장갑 내구도 = 100%');
                    } else {
                        replier.reply(8000 - Number(money.money) + '원이 부족합니다.');
                    }
                } else if (tool == '곡괭이') {
                    if (userTool.곡괭이 == 100) {
                        replier.reply('이미 곡괭이의 내구도가 100% 입니다.');
                    } else if (money.money >= 15000) {
                        sql.query('UPDATE ITEM SET 곡괭이 = 100 WHERE NAME = "' + sender + '"');
                        sql.query('UPDATE USER SET MONEY = MONEY - 15000 WHERE NAME = "' + sender + '"');
                        replier.reply(sender + '님의 장갑이 수리되었습니다.\n돈 -15000\n곡괭이 내구도 = 100%');
                    } else {
                        replier.reply(15000 - Number(money.money) + '원이 부족합니다.');
                    }
                } else {
                    replier.reply('해당 도구는 존재하지 않습니다.');
                }
            } else {
                replier.reply('먼저 가입을 해주세요.');
            }
        }

        if (msg == prefix + '낚시 탈퇴') {
            let findedUser = findUser(sender);
            if (findedUser == false) {
                replier.reply('먼저 가입을 해주세요.');
            } else {
                sql.query('DELETE FROM USER WHERE NAME = "' + sender + '"');
                sql.query('DELETE FROM FISH WHERE NAME = "' + sender + '"');
                sql.query('DELETE FROM ITEM WHERE NAME = "' + sender + '"');
                sql.query('DELETE FROM WHETHER WHERE NAME = "' + sender + '"');
                replier.reply(sender + '님의 계정 탈퇴가 완료되었습니다.');
            }
        }
    }
}

function findUser(userName) {
    let lookForUser = sql.query('SELECT NAME FROM USER WHERE NAME = "' + userName + '"');
    lookForUser.moveToFirst();
    try {
        let user = {
            name: lookForUser.getString(0)
        };
        return true;
    } catch (e) {
        return false;
    }
}

function Whether(userName) {
    let whether = sql.query('SELECT * FROM WHETHER WHERE NAME = "' + userName + '"');
    whether.moveToFirst();
    try {
        let user = {
            name: whether.getString(0),
            FishingWhether: whether.getInt(1),
            CollectingWhether: whether.getInt(2),
            MiningWhther: whether.getInt(3)
        };
        if (user.FishingWhether == 1 || user.CollectingWhether == 1 || user.MiningWhther == 1) {
            return true;
        } else {
            return false;
        }
    } catch (e) {
        return -1;
    }
}

function checkingFish(fish) {
    if (fish[0] == '붕어') {
        return Number(100);
    } else if (fish[0] == '송어') {
        return Number(150);
    } else if (fish[0] == '잉어') {
        return Number(200);
    } else if (fish[0] == '베스') {
        return Number(300);
    } else if (fish[0] == '참돔') {
        return Number(400);
    } else if (fish[0] == '명태') {
        return Number(250);
    } else if (fish[0] == '연어') {
        return Number(500);
    } else if (fish[0] == '돌돔') {
        return Number(400);
    } else if (fish[0] == '농어') {
        return Number(500);
    } else if (fish[0] == '전어') {
        return Number(550);
    } else if (fish[0] == '메기') {
        return Number(650);
    } else if (fish[0] == '오징어') {
        return Number(800);
    } else if (fish[0] == '철갑상어') {
        return Number(1300);
    } else if (fish[0] == '무지개송어') {
        return Number(1800);
    }
}

function rodLevelup(rodLevel) {
    let up = [];
    if (rodLevel.rod == 1) {
        up = [5000, 0, 0].concat(level_2);
        return up;
    } else if (rodLevel.rod == 2) {
        up = [10000, 0, 0].concat(level_3);
        return up;
    } else if (rodLevel.rod == 3) {
        up = [20000, 0, 0].concat(level_4);
        return up;
    } else if (rodLevel.rod == 4) {
        up = [50000, 10, 0].concat(level_5);
        return up;
    } else if (rodLevel.rod == 5) {
        up = [100000, 30, 20].concat(level_6);
        return up;
    } else if (rodLevel.rod == 6) {
        up = [200000, 100, 60].concat(level_7);
        return up;
    } else if (rodLevel.rod >= 7) {
        return false;
    }
}

function checkRodLevel(userName) {
    let fishingRodLevel = sql.query('SELECT FISHINGROD FROM USER WHERE NAME = "' + userName + '"');
    fishingRodLevel.moveToFirst();
    let level = {
        fishingRod: fishingRodLevel.getInt(0)
    };
    let catchable;
    if (level.fishingRod == 1) {
        catchable = level_1;
        return catchable;
    } else if (level.fishingRod == 2) {
        catchable = level_1.concat(level_2);
        return catchable;
    } else if (level.fishingRod == 3) {
        catchable = level_1.concat(level_2, level_3);
        return catchable;
    } else if (level.fishingRod == 4) {
        catchable = level_1.concat(level_2, level_3, level_4);
        return catchable;
    } else if (level.fishingRod == 5) {
        catchable = level_1.concat(level_2, level_3, level_4, level_5);
        return catchable;
    } else if (level.fishingRod == 6) {
        catchable = level_1.concat(level_2, level_3, level_4, level_5, level_6);
        return catchable;
    } else if (level.fishingRod == 7) {
        catchable = level_1.concat(level_2, level_3, level_4, level_5, level_6, level_7);
        return catchable;
    }
}

function help() {
    let msg = '낚시 명령어\n\n';
    const help = [
        '!낚시',
        '!낚시 명령어',
        '!낚시 가입',
        '!낚시 시작',
        '!낚시 활동 (채집/채광)',
        '!낚시 인벤',
        '!낚시 상점',
        '!낚시 탈퇴'
    ];

    msg += help.join('\n');

    return msg;
}

function shopHelp() {
    let msg = '낚시 상점\n\n';
    const help = [
        '!낚시 가격표',
        '!낚시 강화',
        '!낚시 수리 (물건)',
        '!낚시 판매 (물고기) (갯수)',
        '!낚시 일괄 판매 (물고기)'
    ];

    msg += help.join('\n');

    return msg;
}

function priceList() {
    let msg = '물고기 가격표​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​\n\n';
    const list = [
        '=======구매=======',
        '낚싯대 2레벨: 5,000원',
        '낚싯대 3레벨: 10,000원',
        '낚싯대 4레벨: 20,000원',
        '낚싯대 5레벨: 50,000원, 실 10개',
        '낚싯대 6레벨: 100,000원, 실 30개, 철조각 20개',
        '낚싯대 7레벨: 200,000원, 실 100개, 철조각 60개',
        '',
        '장갑 수리: 8000원',
        '곡괭이 수리: 15000원',
        '=======판매=======',
        '붕어: 100원',
        '송어: 150원',
        '잉어: 200원',
        '베스: 300원',
        '참돔: 400원',
        '명태: 250원',
        '연어: 500원',
        '돌돔: 400원',
        '농어: 500원',
        '전어: 550원',
        '메기: 650원',
        '오징어: 800원',
        '철갑상어: 1300원',
        '무지개송어: 1800원'
    ];

    msg += list.join('\n');

    return msg;
}

//대응소스
function onNotificationPosted(sbn, sm) {
    var packageName = sbn.getPackageName();
    if (!packageName.startsWith("com.kakao.tal"))
        return;
    var actions = sbn.getNotification().actions;
    if (actions == null)
        return;
    var userId = sbn.getUser().hashCode();
    for (var n = 0; n < actions.length; n++) {
        var action = actions[n];
        if (action.getRemoteInputs() == null)
            continue;
        var bundle = sbn.getNotification().extras;
        var msg = bundle.get("android.text").toString();
        var sender = bundle.getString("android.title");
        var room = bundle.getString("android.subText");
        if (room == null)
            room = bundle.getString("android.summaryText");
        var isGroupChat = room != null;
        if (room == null)
            room = sender;
        var replier = new com.xfl.msgbot.script.api.legacy.SessionCacheReplier(packageName, action, room, false, "");
        var icon = bundle.getParcelableArray("android.messages")[0].get("sender_person").getIcon().getBitmap();
        var image = bundle.getBundle("android.wearable.EXTENSIONS");
        if (image != null)
            image = image.getParcelable("background");
        var imageDB = new com.xfl.msgbot.script.api.legacy.ImageDB(icon, image);
        com.xfl.msgbot.application.service.NotificationListener.Companion.setSession(packageName, room, action);
        if (this.hasOwnProperty("responseFix")) {
            responseFix(room, msg, sender, isGroupChat, replier, imageDB, packageName, userId != 0);
        }
    }
}