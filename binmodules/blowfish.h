#ifndef _BLOWFISH_DEFINED
#define _BLOWFISH_DEFINED

#include <windows.h>

#define BL_KEY_LEN	256

/* Blowfish global constants */

#define BLOWFISH_BLOCKSIZE			8

/* Blowfish constants */

#define BLOWFISH_SBOX_SIZE			256		/* Number of S-box entries */
#define BLOWFISH_SBOX_SIZE_BYTES	( BLOWFISH_SBOX_SIZE * 4 )
#define BLOWFISH_PARRAY_SIZE		18		/* Number of P-array entries */
#define BLOWFISH_PARRAY_SIZE_BYTES	( BLOWFISH_PARRAY_SIZE * 4 )
#define BLOWFISH_KEYSIZE_BYTES		( ( BLOWFISH_SBOX_SIZE_BYTES * 4 ) + \
										BLOWFISH_PARRAY_SIZE_BYTES )
typedef unsigned char	uint8;
typedef short				int16;
typedef unsigned short	uint16;
typedef long				int32;
typedef unsigned long	uint32;
typedef unsigned long	oik_id;		//идентификатор (ТИ, ТС, таблицы ...)
typedef	__int64				int64;
typedef	unsigned __int64		uint64;

typedef unsigned char		BYTE;

#define mgetBLong(memPtr)		\
		( ( ( uint32 ) memPtr[ 0 ] << 24 ) | ( ( uint32 ) memPtr[ 1 ] << 16 ) | \
		  ( ( uint32 ) memPtr[ 2 ] << 8 ) | ( uint32 ) memPtr[ 3 ] ); \
		memPtr += 4

#define mputBLong(memPtr,data)	\
		memPtr[ 0 ] = ( BYTE ) ( ( ( data ) >> 24 ) & 0xFF ); \
		memPtr[ 1 ] = ( BYTE ) ( ( ( data ) >> 16 ) & 0xFF ); \
		memPtr[ 2 ] = ( BYTE ) ( ( ( data ) >> 8 ) & 0xFF ); \
		memPtr[ 3 ] = ( BYTE ) ( ( data ) & 0xFF ); \
		memPtr += 4

/* A structure to hold the Blowfish key */

typedef struct {
	uint32 P[ BLOWFISH_PARRAY_SIZE ];			/* P-array */
	uint32 S1[ BLOWFISH_SBOX_SIZE ];
	uint32 S2[ BLOWFISH_SBOX_SIZE ];
	uint32 S3[ BLOWFISH_SBOX_SIZE ];
	uint32 S4[ BLOWFISH_SBOX_SIZE ];			/* S-boxes */
	} BLOWFISH_KEY;

void blowfishEncrypt( BLOWFISH_KEY *key, BYTE *data );
void blowfishDecrypt( BLOWFISH_KEY *key, BYTE *data );
int  blowfishEncryptECB( BLOWFISH_KEY *key, BYTE *data, int noBytes );
int  blowfishDecryptECB( BLOWFISH_KEY *key, BYTE *data, int noBytes );
void  blowfishKeyInit( BLOWFISH_KEY *key, BYTE *userKey, int userKeyLength );
uint16  ret8len( uint16 max, uint16 curent ) ;
void  CreateKeyString( LPSTR str, uint16 lstr, LPCSTR userpas, uint32 tstamp ) ;

#endif /* _BLOWFISH_DEFINED */
