#include <emscripten/emscripten.h>
#include <string>
#include <vector>
#include <cstring>
#include <cstdint>
#include <cstdio>
#include <cstdlib>

static const uint32_t K[64]={0xd76aa478,0xe8c7b756,0x242070db,0xc1bdceee,0xf57c0faf,0x4787c62a,0xa8304613,0xfd469501,0x698098d8,0x8b44f7af,0xffff5bb1,0x895cd7be,0x6b901122,0xfd987193,0xa679438e,0x49b40821,0xf61e2562,0xc040b340,0x265e5a51,0xe9b6c7aa,0xd62f105d,0x02441453,0xd8a1e681,0xe7d3fbc8,0x21e1cde6,0xc33707d6,0xf4d50d87,0x455a14ed,0xa9e3e905,0xfcefa3f8,0x676f02d9,0x8d2a4c8a,0xfffa3942,0x8771f681,0x6d9d6122,0xfde5380c,0xa4beea44,0x4bdecfa9,0xf6bb4b60,0xbebfbc70,0x289b7ec6,0xeaa127fa,0xd4ef3085,0x04881d05,0xd9d4d039,0xe6db99e5,0x1fa27cf8,0xc4ac5665,0xf4292244,0x432aff97,0xab9423a7,0xfc93a039,0x655b59c3,0x8f0ccc92,0xffeff47d,0x85845dd1,0x6fa87e4f,0xfe2ce6e0,0xa3014314,0x4e0811a1,0xf7537e82,0xbd3af235,0x2ad7d2bb,0xeb86d391};
static const uint32_t S[64]={7,12,17,22,7,12,17,22,7,12,17,22,7,12,17,22,5,9,14,20,5,9,14,20,5,9,14,20,5,9,14,20,4,11,16,23,4,11,16,23,4,11,16,23,4,11,16,23,6,10,15,21,6,10,15,21,6,10,15,21,6,10,15,21};
inline uint32_t rotl(uint32_t x,uint32_t n){return(x<<n)|(x>>(32-n));}

static std::string md5(const std::string&input){
  uint32_t a0=0x67452301,b0=0xefcdab89,c0=0x98badcfe,d0=0x10325476;
  size_t ml=input.size(); uint64_t bl=(uint64_t)ml*8;
  size_t pl=((ml+8)/64+1)*64;
  std::vector<uint8_t>msg(pl,0);
  memcpy(msg.data(),input.data(),ml);
  msg[ml]=0x80; memcpy(msg.data()+pl-8,&bl,8);
  for(size_t off=0;off<pl;off+=64){
    uint32_t M[16];memcpy(M,msg.data()+off,64);
    uint32_t A=a0,B=b0,C=c0,D=d0;
    for(int i=0;i<64;i++){
      uint32_t F,g;
      if(i<16){F=(B&C)|(~B&D);g=i;}
      else if(i<32){F=(D&B)|(~D&C);g=(5*i+1)%16;}
      else if(i<48){F=B^C^D;g=(3*i+5)%16;}
      else{F=C^(B|~D);g=(7*i)%16;}
      F=F+A+K[i]+M[g];A=D;D=C;C=B;B=B+rotl(F,S[i]);
    }
    a0+=A;b0+=B;c0+=C;d0+=D;
  }
  char buf[33];
  auto le=[](uint32_t v,char*o){uint8_t b[4];memcpy(b,&v,4);sprintf(o,"%02x%02x%02x%02x",b[0],b[1],b[2],b[3]);};
  le(a0,buf);le(b0,buf+8);le(c0,buf+16);le(d0,buf+24);buf[32]=0;
  return std::string(buf);
}

struct BruteState{
  std::string charset;
  int minLen,maxLen,currentLen;
  std::vector<int>indices;
  bool done;
  BruteState():minLen(1),maxLen(6),currentLen(0),done(false){}
  void init(const std::string&cs,int minL,int maxL){
    charset=cs;minLen=minL;maxLen=maxL;
    currentLen=minLen;indices.assign(minLen,0);
    done=charset.empty()||minLen>maxLen;
  }
  bool next(std::string&out){
    if(done)return false;
    out.resize(currentLen);
    for(int i=0;i<currentLen;i++)out[i]=charset[indices[i]];
    int i=currentLen-1;
    while(i>=0){indices[i]++;if(indices[i]<(int)charset.size())break;indices[i]=0;i--;}
    if(i<0){currentLen++;if(currentLen>maxLen)done=true;else indices.assign(currentLen,0);}
    return true;
  }
};

static BruteState g_state;
static std::vector<std::string>g_dictionary;
static size_t g_dictPos=0;
static std::string g_target;
static char g_out_buf[512];
static char g_last_buf[512];

extern "C"{

EMSCRIPTEN_KEEPALIVE
const char* wasm_md5(const char*input){
  static std::string r;r=md5(std::string(input));return r.c_str();
}

EMSCRIPTEN_KEEPALIVE const char* wasm_get_out() {return g_out_buf;}
EMSCRIPTEN_KEEPALIVE const char* wasm_get_last(){return g_last_buf;}

EMSCRIPTEN_KEEPALIVE
void alphabet_init(const char*charset,int minLen,int maxLen,const char*target){
  g_state.init(std::string(charset),minLen,maxLen);
  g_target=std::string(target);
}

EMSCRIPTEN_KEEPALIVE
int alphabet_batch(int batchSize){
  g_out_buf[0]=0;g_last_buf[0]=0;
  std::string pw;
  for(int i=0;i<batchSize;i++){
    if(!g_state.next(pw))return 2;
    if(md5(pw)==g_target){memcpy(g_out_buf,pw.c_str(),pw.size()+1);return 1;}
    if(i==batchSize-1)memcpy(g_last_buf,pw.c_str(),pw.size()+1);
  }
  return 0;
}

EMSCRIPTEN_KEEPALIVE
void dict_init(const char*target){
  g_dictionary.clear();g_dictPos=0;g_target=std::string(target);
}

EMSCRIPTEN_KEEPALIVE
void dict_add_password(const char*pw){g_dictionary.emplace_back(pw);}

EMSCRIPTEN_KEEPALIVE
int dict_batch(int batchSize){
  g_out_buf[0]=0;g_last_buf[0]=0;
  for(int i=0;i<batchSize&&g_dictPos<g_dictionary.size();i++,g_dictPos++){
    const std::string&pw=g_dictionary[g_dictPos];
    memcpy(g_last_buf,pw.c_str(),pw.size()+1);
    if(md5(pw)==g_target){memcpy(g_out_buf,pw.c_str(),pw.size()+1);return 1;}
  }
  if(g_dictPos>=g_dictionary.size())return 2;
  return 0;
}

EMSCRIPTEN_KEEPALIVE size_t dict_total()  {return g_dictionary.size();}
EMSCRIPTEN_KEEPALIVE size_t dict_checked(){return g_dictPos;}

}

