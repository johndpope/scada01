/*
*   An example of an asynchronous C++ node addon.
*   Provided by paulhauner https://github.com/paulhauner
*   License: MIT
*   Tested in node.js v4.4.2 LTS in Ubuntu Linux
*/
#include <node.h>
#include <node_buffer.h>
#include <uv.h>
#include <iostream>
#include <Windows.h>
#include "blowfish.h"
#include "md5.h"

using namespace std;
using namespace v8;
namespace asyncAddon {
	Local<Object> create_buffer(Isolate* isolate, char* data, size_t length)
	{
		return node::Buffer::New(isolate, data, length).ToLocalChecked();
	}
	void Method(const FunctionCallbackInfo<Value>& args) {
		Isolate* isolate = args.GetIsolate();
		LPSTR keystr = NULL;
		LPSTR sbuf = NULL;
		BLOWFISH_KEY* bfKey = NULL;
		v8::String::Utf8Value param2(args[1]->ToString());
		std::string user = std::string(*param2);
		DWORD dwUser = (DWORD)user.size();

		uint32 tstamp;
		double value = args[0]->NumberValue() + args[1]->NumberValue();
		Local<Number> num = Number::New(isolate, value);
		keystr = new char[BL_KEY_LEN + 1];
		tstamp = static_cast<uint32>(args[2]->NumberValue());
		//tstamp = 1481186076;
		//						
		//tstamp += GetCurrentProcessId() ;
		
		
		v8::String::Utf8Value param1(args[0]->ToString());
		std::string kitname = std::string(*param1);
			

		CreateKeyString(keystr, BL_KEY_LEN, kitname.c_str(), tstamp);
		bfKey = new BLOWFISH_KEY;
		blowfishKeyInit(bfKey, (BYTE*)keystr, BL_KEY_LEN);
		sbuf = new char[1025];
		memset(sbuf, 0, 1025);
		uint32 nout = ret8len(1024, (uint16)dwUser);
		lstrcpy(sbuf, user.c_str());
		blowfishEncryptECB(bfKey, (BYTE*)sbuf, nout);
		uint32 tmp_buf[2];
		tmp_buf[0] = tstamp;
		tmp_buf[1] = nout;
		// Set the return value (using the passed in
		// FunctionCallbackInfo<Value>&)
		Handle<Object> ret = Object::New(isolate);
		LPSTR ssbuf = (LPSTR)&tmp_buf;
		ret->Set(String::NewFromUtf8(isolate, "sbuf"), String::NewFromUtf8(isolate, sbuf));
		ret->Set(String::NewFromUtf8(isolate, "tmp_buf"), String::NewFromUtf8(isolate, ssbuf));

		ret->Set(String::NewFromUtf8(isolate, "sizeof"), Number::New(isolate, sizeof(tmp_buf)));
	
		ret->Set(String::NewFromUtf8(isolate, "nout"), Number::New(isolate,nout));
		args.GetReturnValue().Set(ret);

	}
	void step2(const FunctionCallbackInfo<Value>& args)
	{
		Isolate* isolate = args.GetIsolate();
		LPSTR recv_bufptr = new char[1025];

		
		char * resv = node::Buffer::Data(args[1]);
		char * kit = node::Buffer::Data(args[0]);

		
		char buf[40];

		//debug info
		Local<Function> cb = Local<Function>::Cast(args[2]);
		const unsigned argc = 1;
		resv[24] = 0; resv[24] = 0;
		Local<Value> argv[argc] = { String::NewFromUtf8(isolate, resv) };
		cb->Call(Null(isolate), argc, argv);
		Local<Value> argv1[argc]= { String::NewFromUtf8(isolate, kit) };
		cb->Call(Null(isolate), argc, argv1);
		//////////
		//resv = "rEI85lhfEF6BnvaUD6pgcYS8";
		kit = "CKP-TEST01_02";
		memset(buf, 0, 40);
		resv[24] = 0; resv[24] = 0;
		get_digest(resv, buf, kit);
		//send(sock, buf, 36, 0);
		//Handle<Object> ret = Object::New(isolate);
		//ret->Set(String::NewFromUtf8(isolate, "result"), String::NewFromUtf8(isolate, buf));
		args.GetReturnValue().Set(String::NewFromUtf8(isolate, buf));
		//  abacb54d9e430c6bab75c0fdacbfe94a

	}


	void CreateKeyString(LPSTR str, uint16 lstr, LPCSTR userpas, uint32 tstamp)
	{
		LPSTR chr = "`1234567890-=qwertyuiop[]\\asdfghjkl;\'zxcvbnm,./?><MNBVCXZ\":LKJHGFDSA|}{POIUYTREWQ+_)(*&^%$#@!~¸¨úÚõÕçÇùÙøØãÃíÍåÅêÊóÓöÖéÉÔôÛûÂâÀàÏïÐðÎîËëÄäÆæÝýÿ÷ñìèòüáþÞÁÜÒÈÌÑ×ß";
		uint32 lnchr = lstrlen(chr) + 3 * lstrlen(userpas);
		LPSTR nchr = new char[lnchr + 1];
		LPSTR ptr = nchr;
		memset(nchr, 0, lnchr + 1);
		lstrcpyn(ptr, chr, 41);
		ptr += 40;
		lstrcpy(ptr, userpas);
		ptr += lstrlen(userpas);
		lstrcpyn(ptr, chr + 40, 41);
		ptr += 40;
		lstrcpy(ptr, userpas);
		ptr += lstrlen(userpas);
		lstrcpyn(ptr, chr + 80, 41);
		ptr += 40;
		lstrcpy(ptr, userpas);
		ptr += lstrlen(userpas);
		lstrcpy(ptr, chr + 120);
		char snumber[20];
		wsprintf(snumber, "%d", tstamp);
		uint32 bas = lstrlen(snumber);
		uint16 poz = snumber[bas - 1];
		uint8 ind = 0;
		for(int i = 0; i < lstr; i++)
		{
			ind = (uint8)((++ind) % bas);
			poz = (uint16)((poz + snumber[ind]) % lnchr);
			str[i] = nchr[poz];
		}
		delete[] nchr;
	}

	void init(Local<Object> exports) {
		NODE_SET_METHOD(exports, "createkey", Method);
		NODE_SET_METHOD(exports, "step2", step2);
	}

	NODE_MODULE(addon, init)
}