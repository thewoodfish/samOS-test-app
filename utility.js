export function randomStr(len) {
    let ans = '';
    const arr = "1234567890abcdefghijklmnopqrstuvwxyz";

    for (let i = len; i > 0; i--) {
        ans +=
            arr[Math.floor(Math.random() * arr.length)];
    }
    return ans;
}

export function syncData(kvArray, dbValue) {
    for (var i = 0; i < kvArray.length; i++) {
        let [key, value] = kvArray[i].split("=");

        dbValue[key] = value;
    }

    return dbValue;
}