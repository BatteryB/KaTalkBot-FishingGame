const SQLite = require('SQLite');
let sql = new SQLite();
sql.open('your DB file path'); // DB 파일 경로 설정 필수 / DB file path setting required

const prefix = '!';
const commanderPrefix = '>';

function responseFix(room, msg, sender, isGroupChat, replier, imageDB, packageName) {
    if (room == 'your room name') {
        if (msg == prefix + '낚시' || msg == prefix + '낚시 명령어') {
            replier.reply(help());
        }

        if (msg == prefix + '낚시 가입') {
            let findedUser = findUser(sender);
            if (findedUser == false) {
                sql.query('INSERT INTO USER VALUES("' + sender + '", 0, 0, 0)');
                replier.reply('가입 완료 되었습니다.');
                replier.reply('*주의*\n닉네임 변경 시 계정을 못 찾을 수 있습니다.');
            } else {
                replier.reply(sender + '님은 이미 가입되어 있습니다.');
            }
        }

        if (msg == prefix + '낚시 인벤') {
            let findedUser = findUser(sender);
            if (findedUser == true) {
                let findInfo = sql.query('SELECT NAME, FISH, MONEY FROM USER WHERE NAME = "' + sender + '"');
                findInfo.moveToFirst();
                let userInfo = {
                    name: findInfo.getString(0),
                    fish: findInfo.getInt(1),
                    money: findInfo.getInt(2)
                };
                replier.reply('이름: ' + userInfo.name + '\n돈: ' + userInfo.money + '\n물고기 갯수: ' + userInfo.fish);
            } else {
                replier.reply('먼저 가입을 해주세요.');
            }
        }

        if (msg == prefix + '낚시 가격표') {
            replier.reply('===가격표===\n물고기: 개당 100원');
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
                let sales = Number(msg.substr(7));
                let fishNum = sql.query('SELECT FISH FROM USER WHERE NAME = "' + sender + '"');
                fishNum.moveToFirst();
                let userFish = {
                    fish: fishNum.getInt(0)
                };
                if (sales <= userFish.fish) {
                    sql.query('UPDATE USER SET FISH = FISH - ' + sales + ' WHERE NAME = "' + sender + '"');
                    sql.query('UPDATE USER SET MONEY = MONEY + ' + sales * 100 + ' WHERE NAME = "' + sender + '"');
                    replier.reply('판매 완료\n물고기 -' + sales + '\n돈 +' + sales * 100);
                } else {
                    replier.reply('물고기 갯수가 부족합니다.');
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
                let randomTIme = Math.floor(Math.random() * 20001) + 10000;
                sql.query('UPDATE USER SET FISHING_WHETHER = 1 WHERE NAME = "' + sender + '"');
                replier.reply(sender + '이(가) 낚싯줄을 힘차게 던졌다.');
                setTimeout(() => replier.reply(sender + '이(가) 물고기를 낚았다!'), randomTIme);
                setTimeout(() => sql.query('UPDATE USER SET FISH = FISH + 1 WHERE NAME = "' + sender + '"'), randomTIme);
                setTimeout(() => sql.query('UPDATE USER SET FISHING_WHETHER = 0 WHERE NAME = "' + sender + '"'), randomTIme);
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
                        fish: find.getInt(1),
                        fishingWhether: find.getInt(2),
                        money: find.getInt(3)
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
        '!낚시 판매 (물고기갯수)'
    ];

    msg += help.join('\n');

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
