"use strict";

describe("EncodingConverterTest", function () {

    var assert = chai.assert;

    it("StringToArrayBufferAndBack", function () {
        assert.equal("halloTest € à 草", tutao.util.EncodingConverter.utf8Uint8ArrayToString(tutao.util.EncodingConverter.stringToUtf8Uint8Array("halloTest € à 草")));
        assert.equal("", tutao.util.EncodingConverter.utf8Uint8ArrayToString(tutao.util.EncodingConverter.stringToUtf8Uint8Array("")));
        assert.equal("1", tutao.util.EncodingConverter.utf8Uint8ArrayToString(tutao.util.EncodingConverter.stringToUtf8Uint8Array("1")));
    });

    it("HexToArrayBufferAndBack", function () {
        assert.equal("ba9012cb349de910924ed81239d18423", tutao.util.EncodingConverter.arrayBufferToHex(tutao.util.EncodingConverter.hexToArrayBuffer("ba9012cb349de910924ed81239d18423")));
    });

    it("HexBase64Roundtrip ", function () {
        assert.equal("ba9012cb349de910924ed81239d18423", tutao.util.EncodingConverter.base64ToHex(tutao.util.EncodingConverter.hexToBase64("ba9012cb349de910924ed81239d18423")));
    });

    it("Base64Base64UrlRoundtrip ", function () {
        var base64 = tutao.util.EncodingConverter.hexToBase64("ba9012cb349de910924ed81239d18423");
        assert.equal(base64, tutao.util.EncodingConverter.base64UrlToBase64(tutao.util.EncodingConverter.base64ToBase64Url(base64)));
        base64 = tutao.util.EncodingConverter.hexToBase64("");
        assert.equal(base64, tutao.util.EncodingConverter.base64UrlToBase64(tutao.util.EncodingConverter.base64ToBase64Url(base64)));
        base64 = tutao.util.EncodingConverter.hexToBase64("e4");
        assert.equal(base64, tutao.util.EncodingConverter.base64UrlToBase64(tutao.util.EncodingConverter.base64ToBase64Url(base64)));
        base64 = tutao.util.EncodingConverter.hexToBase64("e445");
        assert.equal(base64, tutao.util.EncodingConverter.base64UrlToBase64(tutao.util.EncodingConverter.base64ToBase64Url(base64)));
        base64 = tutao.util.EncodingConverter.hexToBase64("e43434");
        assert.equal(base64, tutao.util.EncodingConverter.base64UrlToBase64(tutao.util.EncodingConverter.base64ToBase64Url(base64)));
        base64 = tutao.util.EncodingConverter.hexToBase64("e4323434");
        assert.equal(base64, tutao.util.EncodingConverter.base64UrlToBase64(tutao.util.EncodingConverter.base64ToBase64Url(base64)));
    });

    it("StringToUtf8Bytes ", function () {
        assert.equal("", tutao.util.EncodingConverter.hexToUtf8(tutao.util.EncodingConverter.utf8ToHex("")));
        assert.equal("€", tutao.util.EncodingConverter.hexToUtf8(tutao.util.EncodingConverter.utf8ToHex("€")));
        assert.deepEqual([226, 130, 172], tutao.util.EncodingConverter.hexToBytes(tutao.util.EncodingConverter.utf8ToHex("€")));
        assert.equal("7=/=£±™⅛°™⅜£¤°±⅛™¤°°®↑°°ÆÐª±↑£°±↑Ω£®°±đ]łæ}đ2w034r70uf", tutao.util.EncodingConverter.hexToUtf8(tutao.util.EncodingConverter.utf8ToHex("7=/=£±™⅛°™⅜£¤°±⅛™¤°°®↑°°ÆÐª±↑£°±↑Ω£®°±đ]łæ}đ2w034r70uf")));
    });

    it("uint8ArrayToBase64 ", function () {
        assert.equal("", tutao.util.EncodingConverter.uint8ArrayToBase64(new Uint8Array(0)));
        assert.equal(tutao.util.EncodingConverter.hexToBase64(tutao.util.EncodingConverter.bytesToHex([32])), tutao.util.EncodingConverter.uint8ArrayToBase64(new Uint8Array([32])));
        assert.equal(tutao.util.EncodingConverter.hexToBase64(tutao.util.EncodingConverter.bytesToHex([32, 65])), tutao.util.EncodingConverter.uint8ArrayToBase64(new Uint8Array([32, 65])));
        assert.equal(tutao.util.EncodingConverter.hexToBase64(tutao.util.EncodingConverter.bytesToHex([32, 65, 66])), tutao.util.EncodingConverter.uint8ArrayToBase64(new Uint8Array([32, 65, 66])));
        assert.equal(tutao.util.EncodingConverter.hexToBase64(tutao.util.EncodingConverter.bytesToHex([32, 65, 66, 67])), tutao.util.EncodingConverter.uint8ArrayToBase64(new Uint8Array([32, 65, 66, 67])));
        assert.equal(tutao.util.EncodingConverter.hexToBase64(tutao.util.EncodingConverter.bytesToHex([32, 65, 66, 67, 68])), tutao.util.EncodingConverter.uint8ArrayToBase64(new Uint8Array([32, 65, 66, 67, 68])));
        assert.equal(tutao.util.EncodingConverter.hexToBase64(tutao.util.EncodingConverter.bytesToHex([0, 255])), tutao.util.EncodingConverter.uint8ArrayToBase64(new Uint8Array([0, 255])));
    });

    it("Base64ToBase64Ext ", function () {
        var hexPaddedGeneratedId = "4fc6fbb10000000000";
        assert.equal("IwQvgF------", tutao.util.EncodingConverter.base64ToBase64Ext(tutao.util.EncodingConverter.hexToBase64(hexPaddedGeneratedId)));
    });

    it("TimestampToHexGeneratedId ", function () {
        var timestamp = 1370563200000;
        assert.equal("4fc6fbb10000000000", tutao.util.EncodingConverter.timestampToHexGeneratedId(timestamp));
        assert.equal("4fc6fbb10000000000", tutao.util.EncodingConverter.timestampToHexGeneratedId(timestamp + ""));
    });

    it("Uint8ArrayToBase64 ", function () {
        assert.equal("YWJjIw==", tutao.util.EncodingConverter.uint8ArrayToBase64(tutao.util.EncodingConverter.stringToUtf8Uint8Array("abc#")));
    });
});