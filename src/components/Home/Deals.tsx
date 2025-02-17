import { FC } from "react";
import styled from "styled-components";
import get from "lodash/get";
import capitalize from "lodash/capitalize";
import { P5, H3, HorizontalDivider } from "@deskpro/app-sdk";
import { getFullName, getSymbolFromCurrency } from "../../utils";
import { format } from "../../utils/date";
import {
    Link,
    Title,
    TwoColumn,
    OverflowText,
    BaseContainer,
} from "../common";
import type {
    Pipeline,
    AccountInto,
    PipelineStage,
    Deal as DealType,
} from "../../services/hubspot/types";

const DealContainer = styled.div`
    margin-bottom: 14px;
`;

type DealOwner = {
    id: string,
    firstName: string,
    lastName: string,
};

type DealProps = {
    hs_object_id: string,
    dealname: string,
    dealstage: string,
    amount: string,
    closedate: string,
    hubspot_owner_id: DealOwner["id"],
    pipeline: DealType["properties"]["pipeline"],
    dealPipelines?: Record<Pipeline["id"], Pipeline>,
};

type Props = {
    deals: DealProps[],
    accountInfo?: AccountInto,
    owners: Record<DealOwner["id"], DealOwner>,
    dealPipelines?: Record<Pipeline["id"], Pipeline>,
};

const Deal: FC<DealProps & { owner: DealOwner, accountInfo?: AccountInto }> = ({
    owner,
    amount,
    dealname,
    pipeline,
    dealstage,
    closedate,
    accountInfo,
    dealPipelines,
    hs_object_id: dealId,
}) => {
    const pipelineData: Pipeline|null = get(dealPipelines, [pipeline], null);
    const pipeLineStage: PipelineStage|null = pipelineData
        ? pipelineData.stages.find(({ id }) => id === dealstage) || null
        : null;

    return (
        <DealContainer>
            <Title
                as={H3}
                title={(
                    <Link to={`/deal/${dealId}`}>{dealname}</Link>
                )}
                link=""
                marginBottom={7}
            />
            <TwoColumn
                leftLabel="Stage"
                leftText={(
                    <OverflowText as={P5}>
                        {capitalize(pipeLineStage ? pipeLineStage.label : dealstage)}
                    </OverflowText>
                )}
                rightLabel="Amount"
                rightText={amount ? `${getSymbolFromCurrency(accountInfo?.companyCurrency)} ${amount}` : "-"}
            />
            <TwoColumn
                leftLabel="Owner"
                leftText={getFullName(owner) || "-"}
                rightLabel="Close Date"
                rightText={format(closedate)}
            />
        </DealContainer>
    );
};

const Deals: FC<Props> = ({ deals, owners, accountInfo, dealPipelines }) => {
    return (
        <>
            <BaseContainer>
                <Title title={`Deals (${deals.length})`} />
                {deals.map((deal) => (
                    <Deal
                        key={deal.hs_object_id}
                        {...deal}
                        owner={owners[deal?.hubspot_owner_id] || {}}
                        accountInfo={accountInfo}
                        dealPipelines={dealPipelines}
                    />
                ))}
            </BaseContainer>
            <HorizontalDivider/>
        </>
    );
};

export { Deals };
