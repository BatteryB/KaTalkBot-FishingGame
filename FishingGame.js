const SQLite = require('SQLite');
let sql = new SQLite();
sql.open('your DB file path'); // DB 파일 경로 설정 필수 / DB file path setting required

const prefix = '!';
const commanderPrefix = '>';

const level_1 = ['붕어', '송어'];
const level_2 = ['잉어', '베스'];
const level_3 = ['참돔', '명태'];
const level_4 = ['연어', '돌돔'];


function responseFix(room, msg, sender, isGroupChat, replier, imageDB, packageName) {
    if (room == 'your room name') {
        if (msg == prefix + '낚시' || msg == prefix + '낚시 명령어') {
            replier.reply(help());
        }

        if (msg == prefix + '낚시 가입') {
            let findedUser = findUser(sender);
            if (findedUser == false) {
                sql.query('INSERT INTO USER VALUES("' + sender + '", 0, 0, 0)');
                sql.query('INSERT INTO FISH VALUES("' + sender + '", 0, 0, 0, 0, 0, 0, 0, 0)');
                replier.reply('가입 완료 되었습니다.');
                replier.reply('*주의*\n닉네임 변경 시 계정을 못 찾을 수 있습니다.');
            } else {
                replier.reply(sender + '님은 이미 가입되어 있습니다.');
            }
        }

        if (msg == prefix + '낚시 인벤') {
            let findedUser = findUser(sender);
            if (findedUser == true) {
                let userInfo = sql.query('SELECT * FROM USER WHERE NAME = "' + sender + '"');
                let userFish = sql.query('SELECT * FROM FISH WHERE NAME = "' + sender + '"');
                userInfo.moveToFirst();
                userFish.moveToFirst();
                let info = {
                    name: userInfo.getString(0),
                    fishingRod: userInfo.getInt(1),
                    money: userInfo.getInt(2),
                    fishingWhether: userInfo.getInt(3)
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
                    돌돔: userFish.getInt(8)

                };
                replier.reply(info.name + '\n낚싯대 레벨: ' + info.fishingRod + '\n돈: ' + info.money + '원​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​\n​\n붕어: ' + fish.붕어 + '\n송어: ' + fish.송어 + '\n잉어: ' + fish.잉어 + '\n베스: ' + fish.베스 + '\n참돔: ' + fish.참돔 + '\n명태: ' + fish.명태 + '\n연어: ' + fish.연어 + '\n돌돔: ' + fish.돌돔);
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
                let checkMoney = sql.query('SELECT MONEY FROM USER WHERE NAME = "' + sender + '"');
                checkMoney.moveToFirst();
                let userMoney = {
                    money: checkMoney.getInt(0)
                };

                if (userMoney.money >= upRod[0]) {
                    sql.query('UPDATE USER SET FISHINGROD = FISHINGROD + 1, MONEY = MONEY - ' + Number(upRod[0]) + ' WHERE NAME = "' + sender + '"');
                    let checkMoney = sql.query('SELECT MONEY FROM USER WHERE NAME = "' + sender + '"');
                    checkMoney.moveToFirst();
                    let Rod = {
                        rod: fishingRod.getInt(0)
                    };
                    let level = Rod.rod+1;
                    replier.reply(sender + '님의 낚싯대가 ' + level + '레벨로 강화되었습니다.\n돈 -' + upRod[0]);
                    replier.reply('이제 ' + upRod[1] + ', ' + upRod[2] + '를 낚을 수 있게 되었습니다.');
                }else if(upRod == false){
                    replier.reply(sender + '님의 낚싯대는 이미 최고 레벨 입니다.');
                }else{
                    replier.reply(Number(upRod[0]) - userMoney.money + '원 이 부족합니다.');
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
                replier.reply(sender + '님의 계정 탈퇴가 완료되었습니다.');
            }
        }

        if (msg == prefix + '낚시 시작') {
            let whether = fishingWhether(sender);
            if (whether == false) {
                let catchable = checkRodLevel(sender);
                let catchFish = Math.floor(Math.random() * catchable.length);
                let randomTime = Math.floor(Math.random() * 1) + 1;
                sql.query('UPDATE USER SET FISHING_WHETHER = 1 WHERE NAME = "' + sender + '"');
                replier.reply(sender + '이(가) 낚싯줄을 힘차게 던졌다.');
                setTimeout(() => replier.reply(sender + '이(가) ' + catchable[catchFish] + '를 낚았다!'), randomTime);
                setTimeout(() => sql.query('UPDATE FISH SET "' + catchable[catchFish] + '" = "' + catchable[catchFish] + '" + 1 WHERE NAME = "' + sender + '"'), randomTime);
                setTimeout(() => sql.query('UPDATE USER SET FISHING_WHETHER = 0 WHERE NAME = "' + sender + '"'), randomTime);
            } else if (whether == true) {
                replier.reply(sender + '님은 이미 낚시를 하고 있습니다');
            } else {
                replier.reply('먼저 가입을 해주세요.');
            }
        }

        if (sender == 'your name') {
            if (msg.startsWith(commanderPrefix + '찾기 ')) {
                let userName = msg.substr(4);
                let find = sql.query('SELECT * FROM USER WHERE NAME = "' + userName + '"');
                find.moveToFirst();
                try {
                    let user = {
                        name: find.getString(0),
                        fishingRod: find.getInt(1),
                        money: find.getInt(2),
                        fishingWhether: find.getInt(3)
                    };
                    replier.reply(JSON.stringify(user, null, 4));
                } catch (e) {
                    replier.reply('유저가 존재하지 않습니다.');
                }
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

function fishingWhether(userName) {
    let whether = sql.query('SELECT FISHING_WHETHER FROM USER WHERE NAME = "' + userName + '"');
    whether.moveToFirst();
    try {
        let user = {
            FishingWhether: whether.getInt(0)
        };
        if (user.FishingWhether == 1) {
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
        return 100;
    } else if (fish[0] == '송어') {
        return 150;
    } else if (fish[0] == '잉어') {
        return 200;
    } else if (fish[0] == '베스') {
        return 300;
    } else if (fish[0] == '참돔') {
        return 400;
    } else if (fish[0] == '명태') {
        return 250;
    } else if (fish[0] == '연어') {
        return 500;
    } else if (fish[0] == '돌돔') {
        return 400;
    }
}

function rodLevelup(rodLevel) {
    let up = [];
    if (rodLevel.rod == 1) {
        up = [5000].concat(level_2);
        return up;
    } else if (rodLevel.rod == 2) {
        up = [10000].concat(level_3);
        return up;
    } else if (rodLevel.rod == 3) {
        up = [20000].concat(level_4);
        return up;
    } else if (rodLevel.rod >= 4) {
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
    } else if (level.fishingRod >= 4) {
        catchable = level_1.concat(level_2, level_3, level_4);
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
        '!낚시 판매 (물고기) (갯수)'
    ];

    msg += help.join('\n');

    return msg;
}

function priceList() {
    let msg = '물고기 가격표​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​\n\n';
    const list = [
        '=======구매=======',
        '낚싯대 2레벨: 5000원',
        '낚싯대 3레벨: 10000원',
        '낚싯대 4레벨: 20000원',
        '=======판매=======',
        '붕어: 100원',
        '송어: 150원',
        '잉어: 200원',
        '베스: 300원',
        '참돔: 400원',
        '명태: 250원',
        '연어: 500원'
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
