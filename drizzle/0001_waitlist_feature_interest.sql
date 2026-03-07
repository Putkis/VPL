alter table if exists public.waitlist_signups
add column if not exists top_feature_interest text;

update public.waitlist_signups
set top_feature_interest = 'other'
where top_feature_interest is null;

alter table if exists public.waitlist_signups
alter column top_feature_interest set default 'other';

alter table if exists public.waitlist_signups
alter column top_feature_interest set not null;
