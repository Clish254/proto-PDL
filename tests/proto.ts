import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { Proto } from '../target/types/proto';
import 'dotenv/config';
import { expect } from 'chai';

describe('proto', async () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    console.log('anchorwallet', process.env.ANCHOR_WALLET);
    const program = anchor.workspace.Proto as Program<Proto>;

    it('Creates and reads a pdl', async () => {
        const testMongoId = '6753629393925456901';
        const [geoJsonPDA, _] = await PublicKey.findProgramAddress(
            [
                anchor.utils.bytes.utf8.encode('geo-json-data'),
                provider.wallet.publicKey.toBuffer(),
                Buffer.from(testMongoId),
            ],
            program.programId,
        );
        console.log({ geoJsonPDA: geoJsonPDA.toString() });

        const testGeoJson = {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "properties": {},
                    "geometry": {
                        "coordinates": [
                            [
                                [
                                    34.87766730452833,
                                    -0.09670039887862458
                                ],
                                [
                                    34.87766730452833,
                                    -0.13026072165678215
                                ],
                                [
                                    34.965763325871364,
                                    -0.13026072165678215
                                ],
                                [
                                    34.965763325871364,
                                    -0.09670039887862458
                                ],
                                [
                                    34.87766730452833,
                                    -0.09670039887862458
                                ]
                            ]
                        ],
                        "type": "Polygon"
                    }
                }
            ]
        };

        const testGeoJsonString = JSON.stringify(testGeoJson);
        try {
            await program.methods
                .saveGeoJson({
                    geojson: testGeoJsonString,
                    mongoId: testMongoId,
                })
                .accounts({
                    user: provider.wallet.publicKey,
                    geoJson: geoJsonPDA,
                    systemProgram: SystemProgram.programId,
                })
                .rpc();
        } catch (error) {
            console.error(error);
            throw new Error();
        }

        const data = await program.account.geoJsonData.fetch(geoJsonPDA);
        console.log({ owner: provider.wallet });
        console.log(data);
        expect(
            (await program.account.geoJsonData.fetch(geoJsonPDA)).geojson,
        ).to.equal(testGeoJsonString);
    });
});
