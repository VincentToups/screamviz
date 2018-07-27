library("sqldf");

d <- read.csv("result.csv");

sqldf("select event, node, sum(1) as count from d where event = 'Community' group by event, node");

sqldf("select distinct target from d where event = 'Role'")



