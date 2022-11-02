use anchor_lang::prelude::*;
use geojson::GeoJson;

declare_id!("CzpJ9weBNofFfa3WTr6HGSuAA29citaCXybasQvU8NLD");

#[program]
pub mod proto {
    use super::*;

    pub fn initialize(_ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
    pub fn save_geo_json(ctx: Context<CreateGeoJson>, geodata: GeoData) -> Result<()> {
        // parse the geojson string and panic if it's invalid
        geodata.geojson.parse::<GeoJson>().unwrap();
        let geo_json_account = &mut ctx.accounts.geo_json;
        geo_json_account.owner = ctx.accounts.user.to_account_info().key();
        geo_json_account.geojson = geodata.geojson;
        geo_json_account.mongo_id = geodata.mongo_id;
        Ok(())
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Eq, PartialEq, Clone, Debug)]
pub struct GeoData {
    geojson: String,
    mongo_id: String,
}

#[derive(Accounts)]
pub struct Initialize {}

#[account]
pub struct GeoJsonData {
    pub owner: Pubkey,
    pub geojson: String,
    pub mongo_id: String,
}
// validation struct
#[derive(Accounts)]
#[instruction(geodata: GeoData)]
pub struct CreateGeoJson<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    // space: 8 discriminator + 2 level + 4 name length + 200 name + 1 bump
    #[account(
        init,
        payer = user,
        space = 10000, seeds = [b"geo-json-data".as_ref(), user.key().as_ref(),geodata.mongo_id.as_ref()], bump
    )]
    pub geo_json: Account<'info, GeoJsonData>,
    pub system_program: Program<'info, System>,
}
